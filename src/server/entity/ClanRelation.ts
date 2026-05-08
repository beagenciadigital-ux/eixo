import {
	Entity,
	Column,
	Index,
	PrimaryGeneratedColumn,
} from 'typeorm'
import Model from './Model'
import type Clan from './Clan'

// import Empire from './Empire'

@Entity('clan relations')
export default class ClanRelation extends Model {
	constructor(clanRelation: Partial<ClanRelation>) {
		super()
		Object.assign(this, clanRelation)
	}

	@Index()
	@PrimaryGeneratedColumn()
	clanRelation_id: number

	@Index()
	@Column({
		type: 'int',
		default: 0,
	})
	c_id1: number

	@Index()
	@Column({
		type: 'int',
		default: 0,
	})
	c_id2: number

	@Index()
	@Column({
		type: 'varchar',
		default: '',
		nullable: true,
	})
	clanRelationFlags: string

	@Column({ type: 'int', default: 1 })
	game_id: number

	@Column({
		type: 'int',
		default: 0,
	})
	clanNewsTime: number

	@Column({
		type: 'varchar',
		default: '',
		nullable: true,
	})
	clan1Name: string

	@Column({
		type: 'varchar',
		default: '',
		nullable: true,
	})
	clan2Name: string

	clan: Clan

}
