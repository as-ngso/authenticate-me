import { faker } from '@faker-js/faker';

const createUserFactory = () => {
  let id = 0;

  return () => {
    id += 1;

    return {
      id,
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.internet.password(),
    };
  };
};

export const createFactoryUser = createUserFactory();

export const createFactoryAccessTokens = (
  userId: number,
  round: number = 5,
) => {
  const tokens = [];

  for (let i = 0; i < round; i++) {
    tokens.push({
      value: faker.random.alphaNumeric(48),
      context: 'access',
      userId,
    });
  }

  return tokens;
};
