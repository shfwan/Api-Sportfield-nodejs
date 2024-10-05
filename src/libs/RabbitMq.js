import { connect } from "amqplib";

export const connection = await connect("amqp://guest:guest@localhost:15672")