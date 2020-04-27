#!/bin/bash
nohup npm run run &
sleep 5
while true
do
  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"principalId": "3281ee12-d723-4077-ad0c-87ef5e993fdd", "resourceId": "a76a8df4-aa0e-41be-8b47-f0003fb7f60a"}' \
  http://localhost:3000/auth/id?verifyCommit="$1"
done

