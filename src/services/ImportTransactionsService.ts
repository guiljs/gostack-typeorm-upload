import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(
      path.join(uploadConfig.directory, fileName),
    );

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: string[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    for (const line of lines) {
      console.log('linha', line);

      const [title, type, value, category] = line.toString().split(',');

      const transaction = await new CreateTransactionService().execute({
        title,
        type: type as 'income' | 'outcome',
        value: Number.parseInt(value),
        category,
      });
      console.log('transaction', transaction);
      transactions.push(transaction);
    }

    console.log('lines', lines);

    console.log('transactions : ', transactions);
    await fs.promises.unlink(path.join(uploadConfig.directory, fileName));
    return transactions;
  }
}

export default ImportTransactionsService;
