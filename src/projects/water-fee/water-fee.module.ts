import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterFeeStatement } from './water-fee-statement.entity';
import { WaterFeeUnit } from './water-fee-unit.entity';
import { WaterFeeService } from './water-fee.service';
import { WaterFeeController } from './water-fee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WaterFeeStatement, WaterFeeUnit])],
  controllers: [WaterFeeController],
  providers: [WaterFeeService],
})
export class WaterFeeModule {}
