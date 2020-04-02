import * as Yup from 'yup';

import File from '../models/File';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class DeliverController {
  async update(request, response) {
    const schema = Yup.object().shape({
      end_date: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body)))
      return response.status(400).json({ error: 'Validation fails' });

    const { deliveryman_id, delivery_id } = request.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman)
      return response.status(400).json({ error: 'Deliveryman not found' });

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery)
      return response.status(400).json({ error: 'Delivery not found' });

    if (!request.file)
      return response
        .status(400)
        .json({ error: 'The signature needs to be sent' });

    if (Number(deliveryman_id) !== delivery.deliveryman_id)
      return response.status(401).json({ error: "You don't have permission." });

    if (!delivery.start_date)
      return response
        .status(400)
        .json({ error: 'This delivery has not yet been start date' });

    if (delivery.canceled_at || delivery.end_date) {
      return response.status(400).json({ error: 'Delivery closed' });
    }

    const { end_date } = request.body;

    const { originalname: name, filename: path } = request.file;

    const file = await File.create({
      name,
      path,
    });

    await delivery.update({
      end_date,
      signature_id: file.id,
    });

    await delivery.reload({
      attributes: ['id', 'product', 'start_date', 'canceled_at', 'end_date'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'name', 'path'],
        },
      ],
    });

    return response.json(delivery);
  }
}

export default new DeliverController();
