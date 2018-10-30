export interface IHistoryOptions<T> {
	/**
	 * Maximum number of entries to store in the history buffer.
	 */
	maxSize: number

	/**
	 * Value to be returned when there is no valid value available.
	 */
	defaultValue?: T

	/**
	 * Function that returns true if an entry is valid, meaning
	 * it is allowed into the history buffer.
	 */
	validate?: (_: T) => boolean
}

export interface IHistory<T> {
	/**
	 * Adds an entry to the history buffer. This ignores duplicates, ignores
	 * entries that fail to pass the filter, and automatically trims the list
	 * to remain within the specified max size. 
	 * 
	 * @param {T} entry The entry being added. 
	 */
	add(entry: T): void

	/**
	 * Retrieves the value of the current history entry.
	 * 
	 * @returns {T} The value of the current history entry.
	 */
	current(): T | undefined

	/**
	 * Applies a new group of options to this instance.
	 * 
	 * @param options 
	 */
	options(options?: IHistoryOptions<T>): void

	/**
	 * @returns {number} The number of entries currently in the history buffer.
	 */
	length(): number

	/**
	 * Functions related to moving back and forth through the history buffer.
	 */
	move: {
		/**
		 * Moves to the previous (older) history entry if we are not already
		 * at the first entry.
		 * 
		 * @returns {boolean} True if movement occurred, or false if we were already at the first entry.
		 */
		prev: () => boolean

		/**
		 * Moves to the next (newer) history entry if we are not already
		 * at the end.
		 * 
		 * @returns {boolean} True if movement occurred, or false if we were already at the end.
		 */
		next: () => boolean

		/**
		 * Moves to the first (oldest) history entry if we are not already
		 * at the first entry.
		 * 
		 * @returns {boolean} True if movement occurred, or false if we were already at the first entry.
		 */
		first: () => boolean

		/**
		 * Moves to the last (most recent) history entry if we are not already
		 * at the end.
		 * 
		 * @returns {boolean} True if movement occurred, or false if we were already at the end.
		 */
		last: () => boolean

		/**
		 * Moves to the space just after the last (most recent) history entry.
		 * 
		 * @returns {boolean} True if movement occurred, or false if we were already at the space past the end.
		 */
		pastLast: () => boolean
	}
}

/**
 * Creates a new instance of a history buffer.
 * 
 * @param options Options to be applied to the new history buffer. The `maxSize` option is required and `defaultValue` is usually recommended.
 */
export function createHistory<T>(options: IHistoryOptions<T>): IHistory<T> {
	let _maxSize: number
	let _defaultValue: T
	let _validate = (_: T) => true
	let _index = -1

	setOptions(options)

	const _entries = <T[]>[]

	const move = {
		first: function moveFirst() {
			if (_entries.length === 0) {
				_index = -1

				return false
			}

			_index = 0

			return true
		},

		last: function moveLast() {
			if (_entries.length === 0) {
				_index = -1

				return false
			}

			_index = _entries.length - 1

			return true
		},

		pastLast: function movePastLast() {
			if (_entries.length === 0) {
				_index = -1

				return false
			}

			_index = _entries.length

			return true
		},

		prev: function movePrev() {
			if (_index <= 0) {
				return false
			}

			_index -= 1

			return true
		},

		next: function moveNext() {
			if (_index === _entries.length) {
				return false
			}

			_index += 1

			return true
		}
	}

	function setOptions(options?: IHistoryOptions<T>): void {
		if (options == null || options.maxSize == null)
			throw (new Error("Options must specify maxSize."))

		if (typeof options.maxSize !== "undefined") {
			_maxSize = options.maxSize
		}

		if (typeof options.defaultValue !== "undefined") {
			_defaultValue = options.defaultValue
		}

		if (typeof options.validate !== "undefined") {
			_validate = options.validate
		}
	}

	function current() {
		return (_entries.length > 0 && _index >= 0 && _index < _entries.length)
			? _entries[_index]
			: _defaultValue
	}

	function add(entry: T) {
		// Ignore invalid values.
		if (!_validate(entry)) {
			_index = _entries.length

			return
		}

		// Remove any dupes of this command.
		for (let i = _entries.length; i >= 0; --i) {
			if (_entries[i] === entry) {
				_entries.splice(i, 1)
			}
		}

		// Make room for the command.
		if (_entries.length >= _maxSize) {
			_entries.shift()
		}

		// And add it to the end.
		_entries.push(entry)

		move.pastLast()
	}

	function length() {
		return _entries.length
	}

	// Implement IHistory interface.
	return {
		current: current,
		move: move,
		add: add,
		options: setOptions,
		length: length
	}
}
