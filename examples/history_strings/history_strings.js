requirejs(["../../dist/index"], function (historyBuffer) {
	const cmdInput = document.getElementById("cmdInput")

	const history = historyBuffer.createHistory({
		maxSize: 10,
		defaultValue: ""
	})

	cmdInput.addEventListener("keypress", evt => {
		switch (evt.key) {
			case "Down":
			case "ArrowDown":
				history.move.next()
				break
			case "Up":
			case "ArrowUp":
				history.move.prev()
				break
			case "Escape":
				history.move.pastLast()
				break
			case "Enter":
				history.add(cmdInput.value)
				break
			default:
				return
		}

		evt.preventDefault()

		cmdInput.value = history.current()
		cmdInput.select()
	})
})
