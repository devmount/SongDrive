# Contributing to this project

First off, thanks for taking the time to contribute! You are awesome! 🎉👏🏻

## Table Of Contents

- [How to contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Adding Translations](#adding-translations)  
- [Adding Achievements](#adding-achievements)

## How to contribute

### Reporting Bugs

Before creating bug reports, please make sure there isn't already an existing issue describing your problem, for bugs are tracked as [GitHub issues](https://github.com/devmount/SongDrive/issues). Simply create an issue and provide the necessary information by filling in [the template](https://github.com/devmount/SongDrive/issues/new?template=bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are also tracked as [GitHub issues](https://github.com/devmount/SongDrive/issues). Before creating enhancement suggestions, please check the existing issues as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please include as many details as possible. Fill in [the template](https://github.com/devmount/SongDrive/issues/new?template=feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

### Pull Requests

Simply fill in [the required template](PULL_REQUEST_TEMPLATE.md). Please do not include issue numbers in the PR title.

#### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Consider starting your commit messages with one of the following emojis:
  - ➕ `:heavy_plus_sign:` when adding a file or implementing a feature
  - 🔨 `:hammer:` when fixing a bug or issue
  - 💚 `:green_heart:` when improving code or comments
  - ⚡ `:zap:` when improving performance
  - 📜 `:scroll:` when updating docs or readme
  - 🔑 `:key:` when dealing with security
  - 🔁 `:repeat:` when updating dependencies or data
  - ✅ `:white_check_mark:` when a new release was built
  - 👕 `:shirt:` when refactoring or removing linter warnings
  - ❌ `:x:` when removing code or files

## Adding Translations

SongDrive has multi language support. You can add a new translation or improve an existing translation in the `src/locales/` directory. To add a new translation, simply copy the `en.json` file and use the two-letter code of the new language for the new file name (e.g. `fr.json` for French). Then translate the values of all keys and submit the file in a corresponding PR.

You can als add a new translation for the documentation in the `src/docs/` directory. To add a new translation, simply copy the `docs.en.md` file and use the two-letter code of the new language for the new file name (e.g. `docs.fr.md` for French). Then translate the content of that file and submit it in a corresponding PR.

## Improving the docs

You can contribute to the docs by editing the [documentation Markdown files](https://github.com/devmount/SongDrive/tree/main/frontend/src/docs) und and create a corresponding PR. SongDrive is currently available in the following languages:

- [English (`docs.en.md`)](https://github.com/devmount/SongDrive/edit/main/frontend/src/docs/docs.en.md)
- [German (`docs.de.md`)](https://github.com/devmount/SongDrive/edit/main/frontend/src/docs/docs.de.md)
