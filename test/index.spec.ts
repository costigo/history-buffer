import { createHistory, IHistory } from "../dist/index"
import * as assert from "assert"
import "mocha"

function addEntries(history: IHistory<string>, quantity: number) {
	for (let initial = history.length() + 1, i = initial; i < initial + quantity; ++i) {
		history.add("entry" + i)
	}
}

describe("createHistory function", () => {
	it("throws due to missing options", () => {
		function missingOptions() {
			return createHistory<string>(<any>undefined)
		}

		assert.throws(missingOptions, new Error("Options must specify maxSize."))
	})

	it("throws due to incomplete options", () => {
		function incompleteOptions() {
			return createHistory<string>(<any>{})
		}

		assert.throws(incompleteOptions, new Error("Options must specify maxSize."))
	})

	it("create history instance with maxSize", () => {
		const history = createHistory<string>({ maxSize: 1 })

		assert.notEqual(history, null)
		assert.equal(typeof history, "object")
	})
})

describe("IHistory<T>", () => {
	describe("with validate option", () => {
		describe("add", () => {
			it("ignores entries shorter than 2 characters", () => {
				const history = createHistory<string>({
					maxSize: 1,
					validate: x => x.length >= 2
				})

				history.add("x")

				assert.equal(history.length(), 0)

				history.add("xx")

				assert.equal(history.length(), 1)
			})

			it("ignores entries containing numbers", () => {
				const history = createHistory<string>({
					maxSize: 1,
					validate: x => !/\d/.test(x)
				})

				history.add("1")

				assert.equal(history.length(), 0)

				history.add("#")

				assert.equal(history.length(), 1)
			})
		})
	})

	describe("add", () => {
		it("starts with 0 length", () => {
			const history = createHistory<string>({ maxSize: 1 })

			assert.equal(history.length(), 0)
		})

		it("changes the length", () => {
			const history = createHistory<string>({ maxSize: 1 })

			history.add("entry1")

			assert.equal(history.length(), 1)
		})

		it("stops changing length after max of 1", () => {
			const history = createHistory<string>({ maxSize: 1 })

			addEntries(history, 3)

			assert.equal(history.length(), 1)
		})

		it("stops changing length after max of 10", () => {
			const history = createHistory<string>({ maxSize: 10 })

			addEntries(history, 9)

			assert.equal(history.length(), 9)

			addEntries(history, 1)

			assert.equal(history.length(), 10)

			addEntries(history, 1)

			assert.equal(history.length(), 10)
		})

		it("ignores duplicates", () => {
			const history = createHistory<string>({ maxSize: 10 })

			history.add("first")
			history.add("second")
			history.add("second")
			history.add("first")

			assert.equal(history.length(), 2)
		})

		it("preserves history order after removing duplicate", () => {
			const history = createHistory<string>({ maxSize: 10 })

			addEntries(history, 10)

			history.add("entry7")

			assert.equal(history.current(), undefined)
			history.move.prev()
			assert.equal(history.current(), "entry7")
			history.move.prev()
			assert.equal(history.current(), "entry10")
			history.move.prev()
			assert.equal(history.current(), "entry9")
			history.move.prev()
			assert.equal(history.current(), "entry8")
			history.move.prev()
			assert.equal(history.current(), "entry6")
			history.move.prev()
			assert.equal(history.current(), "entry5")
			history.move.prev()
			assert.equal(history.current(), "entry4")
			history.move.prev()
			assert.equal(history.current(), "entry3")
			history.move.prev()
			assert.equal(history.current(), "entry2")
			history.move.prev()
			assert.equal(history.current(), "entry1")
			history.move.prev()
			assert.equal(history.current(), "entry1")
		})
	})

	describe("current", () => {
		it("shows undefined defaultValue when empty by default", () => {
			const history = createHistory<string>({ maxSize: 10 })

			assert.strictEqual(history.current(), undefined)
		})

		it("shows supplied defaultValue when empty", () => {
			const history = createHistory<string>({
				maxSize: 10,
				defaultValue: ""
			})

			assert.equal(history.current(), "")
		})
	})

	describe("move", () => {
		describe("prev", () => {
			it("moves to the previous entry", () => {
				const history = createHistory<string>({ maxSize: 2 })

				addEntries(history, 2)

				assert.strictEqual(history.current(), undefined)

				history.move.prev()

				assert.equal(history.current(), "entry2")

				history.move.prev()

				assert.equal(history.current(), "entry1")

				history.move.prev()

				assert.equal(history.current(), "entry1")
			})
		})

		describe("first", () => {
			describe("when history is empty", () => {
				it("returns false", () => {
					const history = createHistory<string>({ maxSize: 1 })

					assert.equal(history.move.first(), false)
				})
			})

			it("moves to the first entry", () => {
				const history = createHistory<string>({
					maxSize: 10,
					defaultValue: ""
				})

				addEntries(history, 3)

				if (history.move.first()) {
					assert.equal(history.current(), "entry1")
				}
				else {
					assert.fail("Should have returned true")
				}
			})
		})

		describe("last", () => {
			describe("when history is empty", () => {
				it("returns false", () => {
					const history = createHistory<string>({ maxSize: 1 })

					assert.equal(history.move.last(), false)
				})
			})

			it("moves to the last entry", () => {
				const history = createHistory<string>({
					maxSize: 10,
					defaultValue: ""
				})

				addEntries(history, 3)

				history.move.prev()

				assert.equal(history.current(), "entry3")

				history.move.prev()

				assert.equal(history.current(), "entry2")

				history.move.last()

				assert.equal(history.current(), "entry3")
			})
		})

		describe("pastLast", () => {
			describe("when history is empty", () => {
				it("returns false", () => {
					const history = createHistory<string>({ maxSize: 1 })

					assert.equal(history.move.pastLast(), false)
				})
			})

			describe("moves past the last entry", () => {
				const history = createHistory<string>({
					maxSize: 10,
					defaultValue: ""
				})

				addEntries(history, 3)

				history.move.prev()

				assert.equal(history.current(), "entry3")

				history.move.prev()

				assert.equal(history.current(), "entry2")

				history.move.pastLast()

				assert.equal(history.current(), "")
			})
		})
	})
})
