#!/usr/bin/env bash
# Detect the languages, frameworks and tool commands of a repository. Read only.
#
#   bash detect-stack.sh [repo-dir]
#
# Prints one block per detected project root (the repo root, plus sub-projects up to 3 levels down,
# for monorepos). Every command printed is a *suggestion* found from manifest files: confirm it
# against the repo's CI config, Makefile and README before writing it into the project profile.
set -uo pipefail

root=$(cd "${1:-.}" && pwd)
prune='-name .git -o -name node_modules -o -name vendor -o -name .venv -o -name venv -o -name target -o -name build -o -name dist -o -name .claude -o -name Pods -o -name .gradle -o -name bin -o -name obj'

has() { [[ -e "$1/$2" ]]; }
grepf() { [[ -f "$1/$2" ]] && grep -qE "$3" "$1/$2" 2>/dev/null; }
say() { printf '  %-12s %s\n' "$1" "$2"; }

node_pm() {
  local d=$1
  if has "$d" pnpm-lock.yaml; then echo pnpm
  elif has "$d" yarn.lock; then echo yarn
  elif has "$d" bun.lockb || has "$d" bun.lock; then echo bun
  else echo npm; fi
}

node_script() { # prints "<pm> run <name>" if package.json defines the script
  local d=$1 name=$2 pm=$3
  grep -qE "\"$name\"[[:space:]]*:" "$d/package.json" 2>/dev/null && echo "$pm run $name"
}

detect() {
  local d=$1 rel=${1#"$root"} found=0
  rel=${rel#/}; [[ -z $rel ]] && rel=.

  out() { if (( ! found )); then echo "== $rel"; found=1; fi; say "$@"; }

  # JavaScript / TypeScript
  if has "$d" package.json; then
    local pm; pm=$(node_pm "$d")
    local fw=""
    for p in next nuxt @angular/core @sveltejs/kit svelte vue react-native expo react @nestjs/core express fastify @remix-run electron vite; do
      grep -q "\"$p\"" "$d/package.json" && { fw="$p"; break; }
    done
    out language "$(has "$d" tsconfig.json && echo TypeScript || echo JavaScript) ($pm)${fw:+, $fw}"
    local t; t=$(node_script "$d" test "$pm"); [[ -n $t ]] && out test "$t"
    t=$(node_script "$d" lint "$pm"); [[ -n $t ]] && out lint "$t"
    t=$(node_script "$d" typecheck "$pm")
    if [[ -n $t ]]; then out typecheck "$t"; elif has "$d" tsconfig.json; then out typecheck "npx tsc --noEmit"; fi
    t=$(node_script "$d" build "$pm"); [[ -n $t ]] && out build "$t"
    t=$(node_script "$d" dev "$pm" || node_script "$d" start "$pm"); [[ -n $t ]] && out run "$t"
    for r in vitest jest mocha playwright cypress; do grep -q "\"$r\"" "$d/package.json" && out runner "$r"; done
  fi

  # Python
  if has "$d" pyproject.toml || has "$d" setup.py || has "$d" requirements.txt || has "$d" Pipfile; then
    local mgr=pip
    if has "$d" uv.lock; then mgr=uv; elif has "$d" poetry.lock; then mgr=poetry; elif has "$d" Pipfile; then mgr=pipenv; fi
    local fw=""
    for p in django fastapi flask starlette; do
      grep -qiE "(^|[\"' ])$p" "$d"/pyproject.toml "$d"/requirements*.txt "$d"/Pipfile 2>/dev/null && { fw=$p; break; }
    done
    out language "Python ($mgr)${fw:+, $fw}"
    local run=""; [[ $mgr == uv ]] && run="uv run "; [[ $mgr == poetry ]] && run="poetry run "
    if [[ $fw == django ]] && has "$d" manage.py; then out test "${run}python manage.py test"; else out test "${run}pytest"; fi
    grepf "$d" pyproject.toml 'ruff' && out lint "${run}ruff check ."
    grepf "$d" pyproject.toml 'mypy' && out typecheck "${run}mypy ."
    grepf "$d" pyproject.toml 'pyright' && out typecheck "${run}pyright"
    has "$d" manage.py && out migrate "${run}python manage.py makemigrations --check"
    has "$d" alembic.ini && out migrate "${run}alembic upgrade head"
  fi

  # Ruby
  if has "$d" Gemfile; then
    if has "$d" config/application.rb; then
      out language "Ruby on Rails"
      if has "$d" spec; then out test "bundle exec rspec <file>"; else out test "bin/rails test <file>"; fi
      out migrate "bin/rails db:migrate"
    else
      out language Ruby
      if has "$d" spec; then out test "bundle exec rspec"; else out test "bundle exec rake test"; fi
    fi
    grepf "$d" Gemfile 'rubocop' && out lint "bundle exec rubocop <files>"
    grepf "$d" Gemfile 'sorbet' && out typecheck "bundle exec srb tc"
  fi

  # Go
  if has "$d" go.mod; then
    out language Go
    out test "go test ./..."
    out lint "go vet ./...$(has "$d" .golangci.yml || has "$d" .golangci.yaml && echo '  +  golangci-lint run')"
    out build "go build ./..."
  fi

  # Rust
  if has "$d" Cargo.toml; then
    out language Rust
    out test "cargo test"
    out lint "cargo clippy --all-targets -- -D warnings"
    out format "cargo fmt --check"
    out build "cargo build"
  fi

  # JVM
  if has "$d" pom.xml; then
    out language "Java/Kotlin (Maven)$(grepf "$d" pom.xml spring-boot && echo ', Spring Boot')"
    local mvn=mvn; has "$d" mvnw && mvn=./mvnw
    out test "$mvn test"
    out build "$mvn -q package -DskipTests"
  fi
  if has "$d" build.gradle || has "$d" build.gradle.kts; then
    local g=gradle; has "$d" gradlew && g=./gradlew
    local fw=""; grep -qE 'spring|com.android' "$d"/build.gradle* 2>/dev/null && fw=$(grep -qE 'com.android' "$d"/build.gradle* && echo ', Android' || echo ', Spring Boot')
    out language "Java/Kotlin (Gradle)$fw"
    out test "$g test"
    out lint "$g check"
    out build "$g build -x test"
  fi

  # .NET
  if compgen -G "$d/*.sln" >/dev/null || compgen -G "$d/*.csproj" >/dev/null || compgen -G "$d/*.fsproj" >/dev/null; then
    out language ".NET"
    out test "dotnet test"
    out format "dotnet format --verify-no-changes"
    out build "dotnet build"
  fi

  # PHP
  if has "$d" composer.json; then
    out language "PHP$(has "$d" artisan && echo ', Laravel')$(has "$d" symfony.lock && echo ', Symfony')"
    if has "$d" artisan; then out test "php artisan test"; else out test "vendor/bin/phpunit"; fi
    grepf "$d" composer.json phpstan && out typecheck "vendor/bin/phpstan analyse"
    grepf "$d" composer.json 'php-cs-fixer|pint' && out lint "$(grepf "$d" composer.json pint && echo vendor/bin/pint --test || echo vendor/bin/php-cs-fixer fix --dry-run)"
    has "$d" artisan && out migrate "php artisan migrate"
  fi

  # Elixir
  if has "$d" mix.exs; then
    out language "Elixir$(grepf "$d" mix.exs phoenix && echo ', Phoenix')"
    out test "mix test"
    out lint "mix credo"
    out format "mix format --check-formatted"
  fi

  # Dart / Flutter
  if has "$d" pubspec.yaml; then
    if grepf "$d" pubspec.yaml 'flutter'; then out language "Dart, Flutter"; out test "flutter test"; out lint "flutter analyze"
    else out language Dart; out test "dart test"; out lint "dart analyze"; fi
  fi

  # Swift
  if has "$d" Package.swift; then out language "Swift (SwiftPM)"; out test "swift test"; out build "swift build"; fi
  if compgen -G "$d/*.xcodeproj" >/dev/null || compgen -G "$d/*.xcworkspace" >/dev/null; then
    out language "Swift/Obj-C (Xcode)"; out test "xcodebuild test -scheme <scheme> -destination <dest>"
  fi

  # C / C++
  if has "$d" CMakeLists.txt; then out language "C/C++ (CMake)"; out build "cmake -S . -B build && cmake --build build"; out test "ctest --test-dir build"; fi
  if has "$d" meson.build; then out language "C/C++ (Meson)"; out test "meson test -C build"; fi

  # Task runners and environment, any language
  if has "$d" Makefile; then
    local targets; targets=$(grep -oE '^[a-zA-Z0-9_.-]+:' "$d/Makefile" | tr -d : | grep -vE '^\.' | grep -E '^(test|tests|check|lint|fmt|format|typecheck|build|ci|dev|run|serve)$' | tr '\n' ' ')
    [[ -n $targets ]] && out make "targets: $targets"
  fi
  has "$d" justfile && out just "justfile present (run: just --list)"
  has "$d" Taskfile.yml && out task "Taskfile.yml present (run: task --list)"
  for f in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do has "$d" $f && { out container "$f"; break; }; done
  has "$d" Dockerfile && out container Dockerfile
  has "$d" .devcontainer && out container ".devcontainer/"
  has "$d" Tiltfile && out container Tiltfile
  [[ $d == "$root" ]] && {
    local ci=""
    has "$d" .github/workflows && ci+=".github/workflows/ "
    has "$d" .gitlab-ci.yml && ci+=".gitlab-ci.yml "
    has "$d" .circleci && ci+=".circleci/ "
    has "$d" Jenkinsfile && ci+="Jenkinsfile "
    has "$d" azure-pipelines.yml && ci+="azure-pipelines.yml "
    has "$d" bitbucket-pipelines.yml && ci+="bitbucket-pipelines.yml "
    [[ -n $ci ]] && out ci "$ci(read these: they are the source of truth for checks)"
  }
  return 0
}

report=$(
detect "$root"
# Sub-projects (monorepos): directories up to depth 3 that carry their own manifest. NUL-separated,
# so names with spaces or other odd characters survive.
seen=$'\n'
# shellcheck disable=SC2086  # $prune is a list of find arguments on purpose
while IFS= read -r -d '' manifest; do
  sub=$(dirname "$manifest")
  case $seen in *$'\n'"$sub"$'\n'*) continue ;; esac
  seen+="$sub"$'\n'
  detect "$sub"
done < <(find "$root" -mindepth 2 -maxdepth 4 \( $prune \) -prune -o -type f \( \
  -name package.json -o -name pyproject.toml -o -name Gemfile -o -name go.mod -o -name Cargo.toml \
  -o -name pom.xml -o -name build.gradle -o -name build.gradle.kts -o -name composer.json \
  -o -name mix.exs -o -name pubspec.yaml -o -name Package.swift -o -name '*.csproj' -o -name CMakeLists.txt \
  \) -print0 2>/dev/null | sort -z)
)
if [[ -n $report ]]; then echo "$report"; else echo "No known manifest found. Ask the user for the build, test and run commands."; fi
