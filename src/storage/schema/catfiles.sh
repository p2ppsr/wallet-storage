#!/bin/bash
clear
# Directory containing the files (update with your target directory)
TARGET_DIR="./"

# Loop through all files in the directory

for file in "$TARGET_DIR"/*; do
  if [[ -f $file ]]; then
    echo "========== File: $(basename "$file") =========="
    cat "$file"
    echo -e "\n"
  fi
done
