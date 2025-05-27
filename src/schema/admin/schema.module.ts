// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.schema';
import { AdminDesignation, AdminDesignationSchema } from './adminDesignation.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
        MongooseModule.forFeature([
            { name: AdminDesignation.name, schema: AdminDesignationSchema }
        ]),
    ],
    exports: [
        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
        MongooseModule.forFeature([
            { name: AdminDesignation.name, schema: AdminDesignationSchema }
        ]),
    ],
})
export class AdminSchemaModule { }