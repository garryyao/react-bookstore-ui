import * as types from '../constants/ActionTypes'

export function newBook(book) {
  return {type: types.ADD_BOOK, book}
}
export function openBook(book, path) {
  return {type: types.OPEN_BOOK, book, path}
}
export function moveBook(book, from, to) {
  return {type: types.MOVE_BOOK, book, from, to};
}
export function editBook(id, label) {
  return {type: types.EDIT_BOOK, id, label}
}
export function deleteBook(id) {
  return {type: types.DELETE_BOOK, id};
}
export function toggleCategory(category, state) {
  return {type: types.TOGGLE_CATEGORY, id: category.id, state};
}
export function editCategory(id, label) {
  return {type: types.EDIT_CATEGORY, id, label}
}
export function deleteCategory(id) {
  return {type: types.DELETE_CATEGORY, id}
}
export function moveCategory(category, to) {
  return {type: types.MOVE_CATEGORY, category, to}
}