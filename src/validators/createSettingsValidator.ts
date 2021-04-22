import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required(),
    chat: Joi.boolean().required(),
  }),
});
