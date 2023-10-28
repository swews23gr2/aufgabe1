import {
    DocumentBuilder,
    type SwaggerCustomOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
//import compression from 'compression';
import { corsOptions } from './config/cors.options.js';
//import { helmetHandlers } from './security/http/helmet.handler.js';
import { nodeConfig } from './config/node.js';
import { paths } from './config/paths.js';

const { httpsOptions, port } = nodeConfig;

const computedVersion = new Date().toLocaleDateString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Student')
        .setDescription('Beispiel für Software Engineering')
        .setVersion(computedVersion)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const options: SwaggerCustomOptions = {
        customSiteTitle: 'SWE 23/24',
    };
    SwaggerModule.setup(paths.swagger, app, document, options);
};

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule, { httpsOptions });
    //app.use(helmetHandlers, compression());
    app.useGlobalPipes(new ValidationPipe());
    setupSwagger(app);
    app.enableCors(corsOptions);

    await app.listen(port);
};

await bootstrap();
