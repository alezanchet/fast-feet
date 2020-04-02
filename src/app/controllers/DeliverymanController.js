import * as Yup from 'yup';

import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(request, response) {
    const { page = 1 } = request.query;

    const deliverymans = await Deliveryman.findAll({
      limit: 10,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return response.json(deliverymans);
  }

  async show(request, response) {
    const schema = await Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(request.params)))
      return response.status(400).json({ error: 'Validation fails' });

    const { id } = request.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return response.json(deliveryman);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(request.body)))
      return response.status(401).json({ error: 'Validation fails' });

    const { email } = request.body;

    const checkDeliverymanExists = await Deliveryman.findOne({
      where: { email },
    });

    if (checkDeliverymanExists)
      return response.status(400).json({ error: 'Deliveryman already exists' });

    const { name } = await Deliveryman.create(request.body);

    return response.json({ name, email });
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(request.body)))
      return response.status(400).json({ error: 'Validation fails' });

    const { id } = request.params;
    const { email } = request.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (email && email !== deliveryman.email) {
      const checkDeliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (checkDeliverymanExists)
        return response
          .status(400)
          .json({ error: 'Deliveryman aldery exists' });
    }

    const { name, avatar_id } = deliveryman.update(request.body);

    return response.json({
      deliveryman: {
        id,
        name,
        email,
        avatar_id,
      },
    });
  }

  async destroy(request, response) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(request.params)))
      return response.status(400).json({ error: 'Validation fails' });

    const deliveryman = await Deliveryman.findByPk(request.params.id);

    if (!deliveryman)
      return response.status(400).json({ error: 'Deliveryman not found' });

    await deliveryman.destroy();

    return response.send();
  }
}

export default new DeliverymanController();
