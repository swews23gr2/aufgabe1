//import { AuthModule } from '../security/auth/auth.module.js';
import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
// import { StudentGetController } from './rest/student-get.controller.js';
// import { StudentMutationResolver } from './graphql/student-mutation.resolver.js';
// import { StudentQueryResolver } from './graphql/student-query.resolver.js';
import { StudentReadService } from './service/student-read.service.js';
// import { StudentWriteController } from './rest/student-write.controller.js';
import { StudentWriteService } from './service/student-write.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities.js';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Studenten.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit Controller- und Service-Klassen sowie der
 * Funktionalität für TypeORM.
 */
@Module({
    //imports: [MailModule, TypeOrmModule.forFeature(entities), AuthModule],
    imports: [MailModule, TypeOrmModule.forFeature(entities)],
    //controllers: [StudentGetController, StudentWriteController],
    providers: [
        StudentReadService,
        StudentWriteService,
        //StudentQueryResolver,
        //StudentMutationResolver,
        QueryBuilder,
    ],
    exports: [StudentReadService, StudentWriteService],
})
export class StudentModule {}
