// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UserInfoSchema } from './userInfo.schema';
import { UserImageData, UserImageDataSchema } from './userImageData.schema';
import { Employee, EmployeeSchema } from './employee.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserInfo.name, schema: UserInfoSchema }]),
        MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
        MongooseModule.forFeature([{ name: UserImageData.name, schema: UserImageDataSchema }]),
    ],
    exports: [
        MongooseModule.forFeature([{ name: UserInfo.name, schema: UserInfoSchema }]),
        MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
        MongooseModule.forFeature([{ name: UserImageData.name, schema: UserImageDataSchema }]),
    ],
})
export class UserSchemaModule {};