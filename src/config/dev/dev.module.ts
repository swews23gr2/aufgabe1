//import { AuthModule } from '../../security/auth/auth.module.js';
import { DbPopulateService } from './db-populate.service.js';
import { DevController } from './dev.controller.js';
import { Module } from '@nestjs/common';
import { Student } from '../../student/entity/student.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    //imports: [TypeOrmModule.forFeature([Student]), AuthModule],
    imports: [TypeOrmModule.forFeature([Student])],
    controllers: [DevController],
    providers: [DbPopulateService],
    exports: [DbPopulateService],
})
export class DevModule {}
