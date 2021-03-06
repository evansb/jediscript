/**
 * Utility functions to work with the AST (Abstract Syntax Tree)
 */
import * as es from 'estree'
import { Walker } from 'acorn/dist/walk'

import { HasID } from './types/static'
import Closure from './Closure'

/**
 * Check whether two nodes are equal.
 *
 * Two nodes are equal if their `__id` field are equal, or
 * if they have `__call`, the `__call` field is checked instead.
 *
 * @param n1 First node
 * @param n2 Second node
 */
export const isNodeEqual = (n1: es.Node, n2: es.Node) => {
  if (n1.hasOwnProperty('__id') && n2.hasOwnProperty('__id')) {
    const first = (n1 as any).__id === (n2 as any).__id
    if (!first) {
      return false
    }
    if (n1.hasOwnProperty('__call') && n2.hasOwnProperty('__call')) {
      return (n1 as any).__call === (n2 as any).__call
    } else {
      return true
    }
  } else {
    return n1 === n2
  }
}

/**
 * Non-destructively search for a node in a parent node and replace it with another node.
 *
 * @param node The root node to be searched
 * @param before Node to be replaced
 * @param after Replacement node
 */
export const replace = (node: es.Node, before: es.Node, after: es.Node) => {
  let found = false

  const go = (n: es.Node): any => {
    if (found) {
      return n
    }

    if (isNodeEqual(n, before)) {
      found = true
      return after
    }

    if (n.type === 'CallExpression') {
      return { ...n, callee: go(n.callee), arguments: n.arguments.map(go) }
    } else if (n.type === 'ConditionalExpression') {
      return {
        ...n,
        test: go(n.test),
        consequent: go(n.consequent),
        alternate: go(n.alternate)
      }
    } else if (n.type === 'UnaryExpression') {
      return { ...n, argument: go(n.argument) }
    } else if (
      n.type === 'BinaryExpression' ||
      n.type === 'LogicalExpression'
    ) {
      return { ...n, left: go(n.left), right: go(n.right) }
    } else {
      return n
    }
  }

  return go(node)
}

const mkLiteralNode = (value: any): es.Node => {
  if (typeof value === 'undefined') {
    return {
      type: 'Identifier',
      name: 'undefined',
      __id: freshId()
    } as any
  } else {
    return {
      type: 'Literal',
      value,
      raw: value,
      __id: freshId()
    } as any
  }
}

const freshId = (() => {
  let id = 0

  return () => {
    id++
    return '__syn' + id
  }
})()

/**
 * Create an AST node from a Source value.
 *
 * @param value any valid Source value (number/string/boolean/Closure)
 * @returns {Node}
 */
export const createNode = (value: any): es.Node => {
  if (value instanceof Closure) {
    return value.node
  }
  return mkLiteralNode(value)
}

export const compose = <S, T extends es.Node & HasID>(
  w1: Walker<T, S>,
  w2: Walker<T, S>
) => {
  return (node: T, state: S, recurse: any) => {
    w1(node, state, recurse)
    w2(node, state, recurse)
  }
}
