# Releasing elgato-teams-video to the Stream Deck Store

This document outlines the steps for releasing the plugin to the Stream Deck Store.

## Prerequisites

1. Make sure your plugin is fully tested on macOS
2. Ensure all icons are properly converted and displaying correctly
3. Verify that the plugin is stable and working as expected

## Pre-release Checklist

- [ ] Update version number in `manifest.json`
- [ ] Update README.md with any new features or changes
- [ ] Ensure all custom icons and images match Elgato's design guidelines
- [ ] Test the plugin thoroughly on macOS
- [ ] Make sure marketplace icon (`imgs/plugin/marketplace.png`) is high-quality and properly sized
- [ ] Check that the plugin description in `manifest.json` is clear and concise

## Packaging for Submission

1. Create a `.streamDeckPlugin` file:

   ```bash
   # Run from the project root
   cd /path/to/elgato-teams-video

   # Build the plugin one last time
   ./script/build

   # Create the plugin package
   npx streamdeck pack
   ```

2. This will create a file named `com.max-beizer.elgato-teams-video.streamDeckPlugin` in your project directory.

## Submission Process

1. Go to the [Elgato Developer Portal](https://developer.elgato.com/documentation/stream-deck/)
2. Sign in or create a developer account if you don't already have one
3. Navigate to the "Stream Deck Store" section
4. Click on "Submit a Plugin"
5. Fill out the submission form:

   - Plugin name: "elgato-teams-video"
   - Description: Provide a clear description of what the plugin does
   - Category: Choose "Productivity" or the most appropriate category
   - Upload your `.streamDeckPlugin` file
   - Provide any additional required information, such as contact details
   - Upload screenshots showing the plugin in action

6. Submit your plugin for review

## After Submission

- Elgato's team will review your plugin
- You may receive feedback or requests for changes
- Once approved, your plugin will be available in the Stream Deck Store

## Version Updates

When releasing updates to your plugin:

1. Increment the `Version` field in `manifest.json`
2. Repackage the plugin following the steps above
3. Submit the updated version through the developer portal

## Useful Resources

- [Elgato Developer Documentation](https://developer.elgato.com/documentation/stream-deck/)
- [Stream Deck Plugin Submission Guidelines](https://developer.elgato.com/documentation/stream-deck/submission-guidelines/)
- [Stream Deck SDK Documentation](https://developer.elgato.com/documentation/stream-deck/sdk/overview/)

## Distribution Outside the Store

You can also distribute your plugin directly to users:

1. Create the `.streamDeckPlugin` file as described above
2. Share the file with users
3. Users can double-click the file to install it to their Stream Deck

For direct distribution, consider hosting the plugin on GitHub releases or a dedicated website.
