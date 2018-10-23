import { ConnectorError } from './errors';
import { FolderAbilityKind } from '..';

/**
 * 
 */
export enum MutationKind {
  FOLDER_SET_TRANSFER_STATE = 5001,
  FOLDER_SET_URI_BASE = 5002,
  FOLDER_ASSIGN_ABILITIES = 5003,
  FOLDER_REVOKE_ABILITIES = 5004,
}

/**
 * 
 */
export enum MutationEvent {
  REQUEST = 'request',
  RESPONSE = 'response',
  CONFIRMATION = 'confirmation',
  APPROVAL = 'approval',
  ERROR = 'error',
}

/**
 * 
 */
export interface MutationEmitter {
  on(kind: MutationEvent.REQUEST, handler: (mutation: this) => any);
  on(kind: MutationEvent.RESPONSE, handler: (mutation: this) => any);
  on(kind: MutationEvent.CONFIRMATION, handler: (count: number, mutation: this) => any);
  on(kind: MutationEvent.APPROVAL, handler: (count: number, mutation: this) => any);
  on(kind: MutationEvent.ERROR, handler: (error: ConnectorError, mutation: this) => any);
  off(kind: MutationEvent.REQUEST, handler?: (mutation: this) => any);
  off(kind: MutationEvent.RESPONSE, handler?: (mutation: this) => any);
  off(kind: MutationEvent.CONFIRMATION, handler?: (count: number, mutation: this) => any);
  off(kind: MutationEvent.APPROVAL, handler?: (count: number, mutation: this) => any);
  off(kind: MutationEvent.ERROR, handler?: (error: ConnectorError, mutation: this) => any);
}

/**
 * 
 */
export interface FolderSetTransferStateMutation extends MutationEmitter {
  resolve(): Promise<this>;
  serialize(): FolderSetTransferStateResult;
}

/**
 * 
 */
export interface FolderSetUriBaseMutation extends MutationEmitter {
  resolve(): Promise<this>;
  serialize(): FolderSetUriBaseResult;
}

/**
 * 
 */
export interface FolderAssignAbilitiesMutation extends MutationEmitter {
  resolve(): Promise<this>;
  serialize(): FolderAssignAbilitiesResult;
}

/**
 * 
 */
export interface FolderRevokeAbilitiesMutation extends MutationEmitter {
  resolve(): Promise<this>;
  serialize(): FolderRevokeAbilitiesResult;
}

/**
 * 
 */
export interface FolderSetTransferStateRecipe {
  mutationKind: MutationKind.FOLDER_SET_TRANSFER_STATE;
  mutationId?: string;
  folderId: string;
  makerId: string;
  data: {
    isEnabled: boolean;
  };
}

/**
 * 
 */
export interface FolderSetUriBaseRecipe {
  mutationKind: MutationKind.FOLDER_SET_URI_BASE;
  mutationId?: string;
  folderId: string;
  makerId: string;
  data: {
    uriBase: string;
  };
}

/**
 * 
 */
export interface FolderAssignAbilitiesRecipe {
  mutationKind: MutationKind.FOLDER_ASSIGN_ABILITIES;
  mutationId?: string;
  folderId: string;
  makerId: string;
  data: {
    target: string;
    abilities: FolderAbilityKind[];
  };
}

/**
 * 
 */
export interface FolderRevokeAbilitiesRecipe {
  mutationKind: MutationKind.FOLDER_REVOKE_ABILITIES;
  mutationId?: string;
  folderId: string;
  makerId: string;
  data: {
    target: string;
    abilities: FolderAbilityKind[];
  };
}

/**
 * 
 */
export interface FolderSetTransferStateResult {
  mutationId: string;
  data: {
    isEnabled: boolean;
  };
}

/**
 * 
 */
export interface FolderSetUriBaseResult {
  mutationId: string;
  data: {
    uriBase: string;
  };
}

/**
 * 
 */
export interface FolderAssignAbilitiesResult {
  mutationId: string;
  data: {
    target: string;
    abilities: FolderAbilityKind[];
  };
}

/**
 * 
 */
export interface FolderRevokeAbilitiesResult {
  mutationId: string;
  data: {
    target: string;
    abilities: FolderAbilityKind[];
  };
}
