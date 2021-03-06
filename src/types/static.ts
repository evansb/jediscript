import * as es from 'estree'
import { SourceLocation } from 'acorn'

import { IError } from './error'

export interface Rule<T extends es.Node> {
  name: string
  checkNodes: { [name: string]: (node: T) => IError[] }
}

export namespace CFG {
  export type Scope = {
    name: string
    parent?: Scope
    entry?: Vertex
    exits: Vertex[]
    node?: es.Node
    proof?: es.Node
    type: Type
    env: {
      [name: string]: Sym
    }
  }

  export type Vertex = {
    id: string
    node: es.Node
    scope?: Scope
    usages: Sym[]
  }

  export type Sym = {
    name: string
    definedAt: es.SourceLocation
    type: Type
    proof: es.Node
  }

  export type Type = {
    name: 'number' | 'string' | 'boolean' | 'function' | 'undefined' | 'any'
    params?: Type[]
    returnType?: Type
  }

  export type EdgeLabel = 'next' | 'alternate' | 'consequent'

  export type Edge = {
    type: EdgeLabel
    to: Vertex
  }
}

export type Comment = {
  type: 'Line' | 'Block'
  value: string
  start: number
  end: number
  loc: SourceLocation | undefined
}

export type HasID = {
  __id: string
}

export interface ITypeError extends IError {
  expected: CFG.Type[]
  got: CFG.Type
  proof?: es.Node
}

export type StaticState = {
  week: number
  parser: {
    program?: es.Program
    errors: IError[]
    comments: Comment[]
  }
  cfg: {
    nodes: { [id: string]: CFG.Vertex }
    edges: { [from: string]: CFG.Edge[] }
    scopes: CFG.Scope[]
    errors: Array<SyntaxError | TypeError>
  }
}

// Predefine simple type as constants
export const numberT: CFG.Type = { name: 'number' }
export const stringT: CFG.Type = { name: 'string' }
export const undefinedT: CFG.Type = { name: 'undefined' }
export const booleanT: CFG.Type = { name: 'boolean' }
export const anyT: CFG.Type = { name: 'any' }
