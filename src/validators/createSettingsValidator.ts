import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
    chat: Joi.boolean().required(),
  }),
});
