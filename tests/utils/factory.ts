import faker from 'faker';
import factory from 'factory-girl';

factory.define(
  'Setting',
  {},
  {
    username: faker.internet.userName,
    chat: faker.datatype.boolean,
  }
);

factory.define(
  'User',
  {},
  {
    email: faker.internet.email,
  }
);

factory.define(
  'Message',
  {},
  {
    text: faker.lorem.sentence,
  }
);

export default factory;
