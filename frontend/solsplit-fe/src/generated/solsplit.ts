export type Solsplit = {
  "version": "0.1.0",
  "name": "solsplit",
  "instructions": [
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "groupAdmin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "groupName",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinGroup",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addExpense",
      "accounts": [
        {
          "name": "expenseAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "expense",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamportsAmount",
          "type": "u64"
        },
        {
          "name": "lamportsPerSol",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "requestSettling",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "authorizeSettling",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteGroup",
      "accounts": [
        {
          "name": "groupAdmin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "expense",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u8"
          },
          {
            "name": "payer",
            "type": "publicKey"
          },
          {
            "name": "lamportsAmount",
            "type": "u64"
          },
          {
            "name": "lamportsPerSol",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "groupNameLength",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "members",
            "type": {
              "array": [
                "publicKey",
                10
              ]
            }
          },
          {
            "name": "membersCount",
            "type": "u8"
          },
          {
            "name": "expensesCount",
            "type": "u32"
          },
          {
            "name": "lockedForSettling",
            "type": "bool"
          },
          {
            "name": "expensePerUser",
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          },
          {
            "name": "settledUsers",
            "type": {
              "array": [
                "bool",
                10
              ]
            }
          },
          {
            "name": "settlingRequest",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MaxGroupSizeReached",
      "msg": "Maximum group size has been reached"
    },
    {
      "code": 6001,
      "name": "UserHasAlreadyJoined",
      "msg": "User has already joined the group"
    },
    {
      "code": 6002,
      "name": "DescriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6003,
      "name": "WrongIndex",
      "msg": "Wrong index"
    },
    {
      "code": 6004,
      "name": "NotAMember",
      "msg": "The user is not a member"
    },
    {
      "code": 6005,
      "name": "GroupIsLocked",
      "msg": "The group is locked by a settling request"
    },
    {
      "code": 6006,
      "name": "ArithmeticError",
      "msg": "Arithmetic error in computing total expense"
    },
    {
      "code": 6007,
      "name": "NoSettlingRequest",
      "msg": "No settling has been requested"
    },
    {
      "code": 6008,
      "name": "UserNotReadyForSettling",
      "msg": "The user can't settle before the members who paid less than the average expense per user"
    }
  ]
};

export const IDL: Solsplit = {
  "version": "0.1.0",
  "name": "solsplit",
  "instructions": [
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "groupAdmin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "groupName",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinGroup",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addExpense",
      "accounts": [
        {
          "name": "expenseAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "expense",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamportsAmount",
          "type": "u64"
        },
        {
          "name": "lamportsPerSol",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "requestSettling",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "authorizeSettling",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteGroup",
      "accounts": [
        {
          "name": "groupAdmin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "expense",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u8"
          },
          {
            "name": "payer",
            "type": "publicKey"
          },
          {
            "name": "lamportsAmount",
            "type": "u64"
          },
          {
            "name": "lamportsPerSol",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "groupNameLength",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "members",
            "type": {
              "array": [
                "publicKey",
                10
              ]
            }
          },
          {
            "name": "membersCount",
            "type": "u8"
          },
          {
            "name": "expensesCount",
            "type": "u32"
          },
          {
            "name": "lockedForSettling",
            "type": "bool"
          },
          {
            "name": "expensePerUser",
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          },
          {
            "name": "settledUsers",
            "type": {
              "array": [
                "bool",
                10
              ]
            }
          },
          {
            "name": "settlingRequest",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MaxGroupSizeReached",
      "msg": "Maximum group size has been reached"
    },
    {
      "code": 6001,
      "name": "UserHasAlreadyJoined",
      "msg": "User has already joined the group"
    },
    {
      "code": 6002,
      "name": "DescriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6003,
      "name": "WrongIndex",
      "msg": "Wrong index"
    },
    {
      "code": 6004,
      "name": "NotAMember",
      "msg": "The user is not a member"
    },
    {
      "code": 6005,
      "name": "GroupIsLocked",
      "msg": "The group is locked by a settling request"
    },
    {
      "code": 6006,
      "name": "ArithmeticError",
      "msg": "Arithmetic error in computing total expense"
    },
    {
      "code": 6007,
      "name": "NoSettlingRequest",
      "msg": "No settling has been requested"
    },
    {
      "code": 6008,
      "name": "UserNotReadyForSettling",
      "msg": "The user can't settle before the members who paid less than the average expense per user"
    }
  ]
};
