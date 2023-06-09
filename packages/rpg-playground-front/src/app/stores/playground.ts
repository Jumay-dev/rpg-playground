import { ChildStore, RootStore } from './index'
import { makeAutoObservable } from 'mobx'
import { CharacterType, SessionCharacterType } from '../../@types/characterType'
import { GAME_SESSION } from '../../mocks/session'
import { PlaygroundStageType } from '../../@types/playgroundTypes'

type IdToInitiativeMapType = Record<CharacterType['id'], string>
type CharactersInitiativeQueue = Array<CharacterType['id']>

export class Playground implements ChildStore {
  stage: PlaygroundStageType = 'roleplay'
  id: string | undefined = undefined
  masterId: string | undefined = undefined
  name: string | undefined = undefined
  characters: SessionCharacterType[] = []
  idToInitiativeMap: IdToInitiativeMapType | undefined = undefined
  charactersQueue: CharactersInitiativeQueue = []
  activeCharacterId: CharacterType['id'] | undefined = undefined
  loading = true

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  get masterCharacters() {
    return this.characters.filter((character) => character.type === 'enemy' || character.type === 'npc')
  }

  get playersCharacters() {
    return this.characters.filter((character) => character.type === 'player')
  }

  get isMaster() {
    return this.masterId === this.root.user.id
  }

  get initialInitiative() {
    if (this.idToInitiativeMap) {
      return this.idToInitiativeMap
    }

    const autogeneratedValue: IdToInitiativeMapType = {}
    this.characters.forEach((character, index) => {
      autogeneratedValue[character.id] = index.toString()
    })
    return autogeneratedValue
  }

  get activeCharacter() {
    return this.characters.find((character) => character.id === this.activeCharacterId)
  }

  getCharacterById = (id: string) => {
    return this.characters?.find((character) => character.id === id)
  }

  setData = (session: typeof GAME_SESSION) => {
    this.id = session.id
    this.stage = 'roleplay'
    this.name = session.name
    this.masterId = session.master_id
    this.characters = session.active_characters
    this.loading = false
  }

  setStage = (newMode: PlaygroundStageType) => {
    this.stage = newMode
  }

  nextCharacter = () => {
    if (!this.activeCharacterId) {
      this.activeCharacterId = this.charactersQueue?.[0]
    } else {
      const currentCharacterQueuePos = this.charactersQueue.indexOf(this.activeCharacterId)
      const newPosition = currentCharacterQueuePos + 1
      if (newPosition > this.charactersQueue.length - 1) {
        return (this.activeCharacterId = this.charactersQueue[0])
      }
      return (this.activeCharacterId = this.charactersQueue[currentCharacterQueuePos + 1])
    }
  }

  previousCharacter = () => {
    if (!this.activeCharacterId) {
      this.activeCharacterId = this.charactersQueue?.[0]
    } else {
      const currentCharacterQueuePos = this.charactersQueue.indexOf(this.activeCharacterId)
      if (currentCharacterQueuePos === 0) {
        return (this.activeCharacterId = this.charactersQueue[this.charactersQueue.length - 1])
      }
      return (this.activeCharacterId = this.charactersQueue[currentCharacterQueuePos - 1])
    }
  }

  setInitiative = (data: IdToInitiativeMapType) => {
    const ids = Object.keys(data)
    const initiativies = Object.values(data)

    const preparedInitiativeToIdMap = {}
    // @ts-ignore
    initiativies.forEach((initiative, index) => (preparedInitiativeToIdMap[+initiative] = ids[index]))

    this.idToInitiativeMap = data
    this.charactersQueue = Object.values(preparedInitiativeToIdMap)
    this.activeCharacterId = this.charactersQueue[0]
  }
}
