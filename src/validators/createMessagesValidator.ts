import { celebrate, Joi, Segments } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
    admin_id: Joi.string().uuid().optional(),
    text: Joi.string().required(),
  }),
});
