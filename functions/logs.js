/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { logger } = require("firebase-functions");
const config = require("./config");

module.exports = {
  complete: () => {
    logger.log("Completed execution of extension");
  },
  userAlreadyInAudience: () => {
    logger.log("Attempted added user already in mailchimp audience");
  },
  errorAddUser: (err) => {
    logger.error("Error when adding user to Mailchimp audience", err);
  },
  userNotInAudience: () => {
    logger.log(
      "Attempted removal failed, member deletion not allowed. Probably because member has already been removed from audience"
    );
  },
  errorRemoveUser: (err) => {
    logger.error("Error when removing user from Mailchimp audience", err);
  },
  init: () => {
    logger.log("Initializing extension with configuration", config);
  },
  initError: (err) => {
    logger.error("Error when initializing extension", err);
  },
  mailchimpNotInitialized: () => {
    logger.error(
      "Mailchimp was not initialized correctly, check for errors in the logs"
    );
  },
  start: () => {
    logger.log("Started execution of extension with configuration");
  },
  userAdded: (userId, audienceId, mailchimpId, status) => {
    logger.log(
      `Added user: ${userId} with status '${status}' to Mailchimp audience: ${audienceId} with Mailchimp ID: ${mailchimpId}`
    );
  },
  userAdding: (userId, audienceId) => {
    logger.log(`Adding user: ${userId} to Mailchimp audience: ${audienceId}`);
  },
  userNoEmail: () => {
    logger.log("User does not have an email");
  },
  userRemoved: (userId, hashedEmail, audienceId) => {
    logger.log(
      `Removed user: ${userId} with hashed email: ${hashedEmail} from Mailchimp audience: ${audienceId}`
    );
  },
  userRemoving: (userId, hashedEmail, audienceId) => {
    logger.log(
      `Removing user: ${userId} with hashed email: ${hashedEmail} from Mailchimp audience: ${audienceId}`
    );
  },
};
