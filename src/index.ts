import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import process from 'process';
import path from 'path';
import inquirer from 'inquirer';

import dotenv from 'dotenv';
dotenv.config({
	path: path.join(process.cwd(), '.env')
});

// AWS configuration
AWS.config.update({
	region: process.env.AWS_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();

const backupTable = async (tableName: string, backupFilePath: string): Promise<void> => {
	try {
		// Scan the DynamoDB table to retrieve all items
		const scanParams: AWS.DynamoDB.DocumentClient.ScanInput = {
			TableName: tableName,
		};
		const scanResponse = await dynamodb.scan(scanParams).promise();
		const items = scanResponse.Items;

		// Save the items to a local file
		fs.writeFileSync(backupFilePath, JSON.stringify(items, null, 2));
	} catch (error) {
		console.error('Error creating backup:', error);
		throw error;
	}
};

const restoreTable = async (tableName: string, backupFilePath: string, primaryKey: string): Promise<void> => {
	try {
		// Read the backup file
		const backupData = fs.readFileSync(backupFilePath, 'utf8');
		const items = JSON.parse(backupData);

		// Delete all items from the DynamoDB table
		for (const item of items) {
			const deleteParams: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
				TableName: tableName,
				Key: {
					[primaryKey]: item[primaryKey],
				},
			};
			await dynamodb.delete(deleteParams).promise();
		}

		// Restore the items from the backup file
		for (const item of items) {
			const putParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
				TableName: tableName,
				Item: item,
			};
			await dynamodb.put(putParams).promise();
		}
	} catch (error) {
		console.error('Error restoring table:', error);
		throw error;
	}
};

const start = async (): Promise<void> => {
	// Introduction, developed by Askrella
	console.log('')
	console.log('DynamoDB Backup & Restore Solution');
	console.log('Developed by Askrella');
	console.log('https://askrella.de');
	console.log('');

	// Menu
	const menuPrompt = await inquirer.prompt([
		{
			type: 'list',
			name: 'menu',
			message: 'Select an option:',
			choices: [
				{
					name: 'Backup table',
					value: 'backup',
				},
				{
					name: 'Restore table',
					value: 'restore',
				},
			],
		},
	]);

	if (menuPrompt.menu === 'backup') {
		// Table name
		const tableNamePrompt = await inquirer.prompt([
			{
				type: 'input',
				name: 'tableName',
				message: 'Enter the name of the DynamoDB table to backup:',
			},
		]);

		// Backup file path
		const backupFilePathPrompt = await inquirer.prompt([
			{
				type: 'input',
				name: 'backupFilePath',
				message: 'Enter the path to save the backup file:',
				default: path.join(process.cwd(), `${tableNamePrompt.tableName}.json`),
			},
		]);

		await backupTable(tableNamePrompt.tableName, backupFilePathPrompt.backupFilePath);

		console.log(`Table backup saved to: ${backupFilePathPrompt.backupFilePath}`);
	}

	if (menuPrompt.menu === 'restore') {
		// Table name
		const tableNamePrompt = await inquirer.prompt([
			{
				type: 'input',
				name: 'tableName',
				message: 'Enter the name of the DynamoDB table to restore:',
			},
		]);

		// Backup file path
		const backupFilePathPrompt = await inquirer.prompt([
			{
				type: 'input',
				name: 'backupFilePath',
				message: 'Enter the path to the backup file:',
				default: path.join(process.cwd(), `${tableNamePrompt.tableName}.json`),
			},
		]);

		// Primary key
		const primaryKeyPrompt = await inquirer.prompt([
			{
				type: 'input',
				name: 'primaryKey',
				message: 'Enter the name of the primary key:',
			},
		]);

		await restoreTable(
			tableNamePrompt.tableName,
			backupFilePathPrompt.backupFilePath,
			primaryKeyPrompt.primaryKey
		);
		console.log(`Table '${tableNamePrompt.tableName}' restored from backup: ${backupFilePathPrompt.backupFilePath}`)
	}
};

start();