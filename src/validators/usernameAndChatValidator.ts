import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    username: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    chat: Joi.boolean().required(),
  }),
});
