import { Injectable } from '@nestjs/common';
import { type SendMailOptions } from 'nodemailer';
import { getLogger } from '../logger/logger.js';
import { mailConfig } from '../config/mail.js';

export interface SendMailParams {
    readonly subject: string;
    readonly body: string;
}

@Injectable()
export class MailService {
    readonly #logger = getLogger(MailService.name);

    async sendmail({ subject, body }: SendMailParams) {
        if (!mailConfig.activated) {
            this.#logger.warn('#sendmail: Mail deaktiviert');
            return;
        }

        const from = '"Joe Doe" <Joe.Doe@acme.com>';
        const to = '"Foo Bar" <Foo.Bar@acme.com>';

        const data: SendMailOptions = { from, to, subject, html: body };
        this.#logger.debug('#sendMail: data=%o', data);

        try {
            const nodemailer = await import('nodemailer');
            await nodemailer.createTransport(mailConfig.options).sendMail(data);
        } catch (err) {
            this.#logger.warn('#sendmail: Fehler %o', err);
        }
    }
}
