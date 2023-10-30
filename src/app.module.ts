import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
// TODO: Muss noch implementiert werden!
import { type ApolloDriverConfig } from '@nestjs/apollo';
//import { AuthModule } from './security/auth/auth.module.js';
import { DevModule } from './config/dev/dev.module.js';
import { GraphQLModule } from '@nestjs/graphql';
//import { HealthModule } from './health/health.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { StudentGetController } from './student/rest/student-get.controller.js';
import { StudentModule } from './student/student.module.js';
import { StudentWriteController } from './student/rest/student-write.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
// TODO: Muss noch implementiert werden!
import { graphQlModuleOptions } from './config/graphql.js';
import { typeOrmModuleOptions } from './config/db.js';

@Module({
    imports: [
        //AuthModule,
        StudentModule,
        DevModule,
        GraphQLModule.forRoot<ApolloDriverConfig>(graphQlModuleOptions),
        LoggerModule,
        //HealthModule,
        TypeOrmModule.forRoot(typeOrmModuleOptions),
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes(
                StudentGetController,
                StudentWriteController,
                'auth',
                'graphql',
            );
    }
}
