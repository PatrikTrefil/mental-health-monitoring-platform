#!/bin/bash
# The script is used to register a new user with the role of form manager in a Form.io instance.

function print_usage {
  echo "Non-interactive usage:"
  echo "    init.sh <admin_email> <admin_password> <formio_url> <new_user_id> <new_user_password>"
  echo ""
  echo "If any of the parameters are not provided, you will be prompted for them interactively."
}

# Function to prompt for input if a variable is not set
function prompt_for {
  local var_name=$1
  local prompt_message=$2
  local is_password=${3:-false}

  # Use the value of a variable named $var_name
  eval local var_value=\$$var_name

  # if var_value is empty
  if [[ -z "$var_value" ]]; then
    if $is_password; then
      # If it's a password field, don't show the input
      read -rsp "$prompt_message" var_value
      echo # Move to a new line after the password input
    else
      read -rp "$prompt_message" var_value
    fi
    # Assign the read value back to the variable named $var_name
    eval $var_name=\$var_value
  fi
}

# Help options
if [ "$1" = '-h' -o "$1" = '--help' ]; then
  print_usage
  exit 0
fi

# Invalid number of arguments
if [ ! -z ${6+x} ]; then
  echo "Error: Unexpected sixth argument provided." >&2
  print_usage
  exit 1
fi

# Set variables using positional parameters (some may be empty)
ADMIN_EMAIL="$1"
ADMIN_PASSWORD="$2"
FORMIO_URL="$3"
NEW_USER_ID="$4"
NEW_USER_PASSWORD="$5"

# Prompt for values interactively if they are not set
prompt_for ADMIN_EMAIL "Enter admin email: "
prompt_for ADMIN_PASSWORD "Enter admin password: " true
prompt_for FORMIO_URL "Enter URL of the Form.io instance: "
prompt_for NEW_USER_ID "Enter ID of new user: "
prompt_for NEW_USER_PASSWORD "Enter password for new user: " true

# Login request and token extraction
formio_token="$(
    curl --location "${FORMIO_URL}/user/login" \
    --silent \
    --include \
    --header 'Content-Type: application/json' \
    --data "{
        \"data\": {
            \"email\": \"${ADMIN_EMAIL}\",
            \"password\": \"${ADMIN_PASSWORD}\"
        }
    }" | grep -Poi "x-jwt-token: *\K(.+)")"

# Create a new user
register_response="$(curl --location -g "${FORMIO_URL}/zamestnanec/spravce-dotazniku/register" \
    --silent \
    --header 'Content-Type: application/json' \
    --header "x-jwt-token: ${formio_token}" \
    --data "{
        \"data\": {
            \"id\": \"${NEW_USER_ID}\",
            \"password\": \"${NEW_USER_PASSWORD}\"
        }
    }"
    )"

if $(echo $register_response | grep -q "ValidationError"); then
    RED='\033[0;31m'
    echo -e "${RED}Error registering user ${NEW_USER_ID}:"

    # check if jq is installed
    if which jq > /dev/null; then
        echo $register_response | jq --color-output
    else
        echo $register_response
    fi
else
    GREEN='\033[0;32m'
    echo -e "${GREEN}Successfully registered user ${NEW_USER_ID}"
fi


