const functions = require("firebase-functions-test");
const defaultConfig = require("./utils").defaultConfig;
const testEnv = functions();
jest.mock("mailchimp-api-v3");

// configure config mocks (so we can inject config and try different scenarios)
jest.doMock("../config", () => defaultConfig);
const api = require("../index");

describe("mergeFieldsHandler", () => {
  let mailchimpMock
  let configureApi = (config) => {
    api.processConfig(config);
  };

  beforeAll(() =>{
    mailchimpMock = require('mailchimp-api-v3')
  })

  beforeEach(() => {
    mailchimpMock.__clearMocks()
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("should make no calls with empty config", async () => {
    configureApi(defaultConfig);
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(null);
    expect(mailchimpMock.__mocks.post).toHaveBeenCalledTimes(0);
  });

  it("should make no calls with missing mergeFields", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(null);
    expect(mailchimpMock.__mocks.post).toHaveBeenCalledTimes(0);
  });

  it("should make no calls with invalid mergeFields", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: { field1: "value"}
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(null);
    expect(mailchimpMock.__mocks.post).toHaveBeenCalledTimes(0);
  });

  it("should make no calls with invalid statusField", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        statusField: {
          field1: "value"
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(null);
    expect(mailchimpMock.__mocks.post).toHaveBeenCalledTimes(0);
  });

  it("should make no calls when subscriberEmail field not found in document", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.post).toHaveBeenCalledTimes(0);
  });

  it("should set data for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "new phone number",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data for user when new value only", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "old first name",
      lastName: "old last name",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "new phone number",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data for user when old value only", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "old first name",
      lastName: "old last name",
      phoneNumber: "old phone number",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data for user when changed boolean only", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          hasThing: "HAS_THING",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "old first name",
      lastName: "old last name",
      hasThing: true,
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      hasThing: false,
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          HAS_THING: false,
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data for user with nested subscriber email", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "contactInfo.emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      contactInfo: {
        emailAddress: "test@example.com",
      },
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "new phone number",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data from nested config for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          "userData.firstName": "FNAME",
          "userData.lastName": "LNAME",
          "userData.phoneNumber": "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      emailAddress: "test@example.com",
      userData: {
        firstName: "new first name",
        lastName: "new last name",
        phoneNumber: "new phone number",
      },
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "new phone number",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should set data with complex field config for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: {
            "mailchimpFieldName": "FNAME",
          },
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const testUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      after: {
        data: () => testUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
          PHONE: "new phone number",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should update data selectively for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "old first name",
      lastName: "old last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "new first name",
          LNAME: "new last name",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should use JMESPath query", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
          "data[?field=='phoneNumber'].value | [0]": "PHONE",
          "history[0].key": "LATEST_CHANGE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "first name",
      lastName: "last name",
      data: [{
        field: 'phoneNumber',
        value: "old phone number",
      }, {
        field: "country",
        value: "Australia"
      }],
      history: [{
        key: 'firstName',
        to: 'Some other first name',
      }],
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "first name",
      lastName: "last name",
      data: [{
        field: 'phoneNumber',
        value: "new phone number",
      }, {
        field: "country",
        value: "New Zealand"
      }],
      history: [{
        key: 'lastName',
        to: 'Some other name',
      },{
        key: 'firstName',
        to: 'Some other last name',
      }],
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          PHONE: "new phone number",
          LATEST_CHANGE: "lastName"
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should always push data for fields with when=always configuration for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: {
            "mailchimpFieldName": "FNAME",
            "when": "always"
          },
          lastName: "LNAME",
          phoneNumber: {
            "mailchimpFieldName": "PHONE",
            "when": "changed"
          },
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "first name",
      lastName: "old last name",
      phoneNumber: "existing phone number",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "first name",
      lastName: "new last name",
      phoneNumber: "existing phone number",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        merge_fields: {
          FNAME: "first name",
          LNAME: "new last name",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should update email address for user", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          emailAddress: "EMAIL",
          firstName: "FNAME",
          lastName: "LNAME",
          phoneNumber: "PHONE",
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      displayName: "lee",
      firstName: "old first name",
      lastName: "old last name",
      phoneNumber: "new phone number",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      displayName: "lee",
      firstName: "new first name",
      lastName: "new last name",
      phoneNumber: "new phone number",
      emailAddress: "test2@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test2@example.com",
        merge_fields: {
          EMAIL: "test2@example.com",
          FNAME: "new first name",
          LNAME: "new last name",
        },
        status_if_new: "mailchimpContactStatus",
      }
    );
  });

  it("should update the status of the user, with no transformation", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
        },
        statusField: {
          documentPath: "statusField"
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      statusField: "transactional",
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      statusField: "pending",
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        status: "pending",
        status_if_new: "pending",
      }
    );
  });

  it("should update the status of the user, with boolean transformation to subscribed", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
        },
        statusField: {
          documentPath: "subscribed",
          statusFormat: "boolean"
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      subscribed: false,
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      subscribed: true,
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        status: "subscribed",
        status_if_new: "subscribed",
      }
    );
  });

  it("should update the status of the user, with boolean transformation to unsubscribed", async () => {
    configureApi({
      ...defaultConfig,
      mailchimpMergeField: JSON.stringify({
        mergeFields: {
          firstName: "FNAME",
          lastName: "LNAME",
        },
        statusField: {
          documentPath: "subscribed",
          statusFormat: "boolean"
        },
        subscriberEmail: "emailAddress",
      }),
    });
    const wrapped = testEnv.wrap(api.mergeFieldsHandler);

    const beforeUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      subscribed: true,
      emailAddress: "test@example.com",
    };
    const afterUser = {
      uid: "122",
      firstName: "first name",
      lastName: "last name",
      subscribed: false,
      emailAddress: "test@example.com",
    };

    const result = await wrapped({
      before: {
        data: () => beforeUser,
      },
      after: {
        data: () => afterUser,
      },
    });

    expect(result).toBe(undefined);
    expect(mailchimpMock.__mocks.put).toHaveBeenCalledWith(
      "/lists/mailchimpAudienceId/members/55502f40dc8b7c769880b10874abc9d0",
      {
        email_address: "test@example.com",
        status: "unsubscribed",
        status_if_new: "unsubscribed",
      }
    );
  });
});
