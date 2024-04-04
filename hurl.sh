#!/usr/bin/env bash

# Check that auth environment variables are defined.
if [[ -z "${OKANE_USER_EMAIL}" ]]; then
  echo 'OKANE_USER_EMAIL environment variable not set.'
  exit 1
fi

if [[ -z "${OKANE_USER_PASSWORD}" ]]; then
  echo 'OKANE_USER_PASSWORD environment variable not set.'
  exit 1
fi

# Check for custom ARGs:
# --no-auth: don't make a request to the login endpoint
should_authenticate=true
filtered_args=()

for arg in "$@"; do
    if [[ "$arg" == "--no-auth" ]]; then
        should_authenticate=false
    else
        filtered_args+=("$arg")
    fi
done

script_dir=$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")
login_request_file=$(fd postLogin "$script_dir")

cookie_jar=$(mktemp)
variables_file=$(mktemp)
{
    echo "BASE_URL=http://localhost:5000/api"
    echo "OKANE_USER_EMAIL=$OKANE_USER_EMAIL"
    echo "OKANE_USER_PASSWORD=$OKANE_USER_PASSWORD"
} >> "$variables_file"

# Make request to login endpoint and capture auth token & refresh token.
if $should_authenticate; then
    jwt=$(
        hurl --variables-file "$variables_file" --cookie-jar "$cookie_jar" "$login_request_file" \
             | jq -r '.items[0].jwtToken')  # -r: Output raw string without quotes.
    echo "AUTH_HEADER=Bearer $jwt" >> "$variables_file"
fi

if [[ "$should_authenticate" = true && -z "$jwt" ]]; then
    echo "Error authenticating."
    exit 1
fi

# Make the request.
hurl --variables-file "$variables_file" --cookie "$cookie_jar" "${filtered_args[@]}" | jq

# Clean up temp files.
trap 'rm -f "$cookie_jar" "$variables_file"' EXIT
