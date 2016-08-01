import test from 'ava'
import { Any, Snapshot, Never, unbox } from './common'
import { init } from './interpreter-legacy'

test('init', (t) => {
  const context = {
    'undefined': undefined,
    'x': 3
  }
  const snapshot = new Snapshot({ code: 'function foo()' })
  t.deepEqual<Any>(snapshot.getVar('undefined'), Never) 
  t.deepEqual<Any>(snapshot.getVar('x'), Never) 

  init(snapshot, context)

  t.deepEqual<Any>(snapshot.getVar('x'), { type: 'foreign', id: 'x' })   
  t.deepEqual<any>(unbox(snapshot.getVar('x'), context), 3)
  t.true(typeof unbox(snapshot.getVar('undefined'), context) === 'undefined')
})

test('read global vars', (t) => {
  const context = {
    'foo': 3
  }
  const snapshot = new Snapshot({ code: 'foo;' })
  init(snapshot, context)
  t.deepEqual<any>(unbox(snapshot.getVar('foo'), context), 3)
})
