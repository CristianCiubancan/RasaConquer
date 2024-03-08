"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield amqplib_1.default.connect('amqp://user:password@localhost');
        const channel = yield conn.createChannel();
        const queues = ['accountQueue', 'gameQueue'];
        queues.forEach((queue) => __awaiter(this, void 0, void 0, function* () {
            yield channel.assertQueue(queue, { durable: false });
            console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
            channel.consume(queue, (msg) => {
                if (msg !== null) {
                    console.log(`[x] Received in ${queue}: ${msg.content.toString()}`);
                    channel.ack(msg);
                }
            }, {
                noAck: false
            });
        }));
    });
}
start().catch(console.warn);
