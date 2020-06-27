import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, fileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const transactions = [];
    parseCSV.on('data', async line => {
      console.log(line);
      const [title, type, value, category] = line;
      const transaction = await new CreateTransactionService().execute({
        title,
        value,
        type,
        category,
      });
      console.log(transaction);
      transactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    console.log('TRansactions');
    console.log(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
