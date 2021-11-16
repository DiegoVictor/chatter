import faker from 'faker';
import factory from 'factory-girl';

factory.define(
  'Setting',
  {},
  {
    user_id: faker.datatype.uuid,
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
