import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const hasValidBalance =
        (await transactionsRepository.getBalance()).total - value >= 0;

      if (!hasValidBalance) {
        throw new AppError('Not enough balance');
      }
    }

    let categ = await categoriesRepository.findOne({ title: category });

    if (!categ) {
      categ = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categ);
    }

    const category_id = categ.id;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
