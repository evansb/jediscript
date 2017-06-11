import { parse } from 'acorn'
import { runConformationTests } from '../src/harness/conformation'
import { evalProgram, createInterpreter } from '../src/interpreter'

it('evaluates program', () => {
  const generator = evalProgram(parse('1 + 2;'), createInterpreter())
  const states = []
  let g = generator.next()
  while (g.value.isRunning) {
    states.push(g.value)
    g = generator.next()
  }
  expect(states[0].node.type).toBe('ExpressionStatement')
  expect(states[1].node.type).toBe('BinaryExpression')
  expect(states[2].node.type).toBe('Literal')
  expect(states[3].node.type).toBe('Literal')
  expect(states[4].node.type).toBe('Literal')
  expect(states[5].node.type).toBe('Literal')
  expect(states[6].node.type).toBe('BinaryExpression')
  expect(states.length).toBe(7)
})

it('detects calling non function value', () => {
  const gen = evalProgram(parse(`2(3);`), createInterpreter())
  gen.next()
  gen.next()
  gen.next()
  gen.next()
  const g = gen.next().value
  expect(g.errors.size).toBe(1)
})

it('passes Week 3 Conformation Test', () => {
  runConformationTests('conformation/week-3.js')
})
