
# aws-dynamodb-backup

This is a Node.js project designed to back up and restore AWS DynamoDB tables.

## Requirements

This project requires Node.js to run.

## Installation & Setup

To install this project, follow these steps:

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Create a `.env` file in the root directory of the project and set the required environment variables (see below).
4. Run `npm run start` to run the project.

## Environment Variables

The following environment variables need to be set for the project:

- `AWS_REGION`: The AWS region where your DynamoDB tables are located.
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.

These variables should be stored in a `.env` file in the root directory of the project.

## Disclaimer

In no event will we be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this project.

Don't use this project unless you know what you're doing.

## License

This project is licensed under the MIT license.
