---
title: CHANGELOG V1.1
date: 25/04/2022
---

# Features

-   [Login] Uhuru login page chrome tab should display 'Uhuru' instead of 'digital twin' #82

    -   Change browser tab title to Uhuru

-   [Flow] Send private message #295

    -   'Send private message' and 'Share with a friend' should be combined to one dialog. So the same principle as with instagram. You can send a post to someone with or without a message and they receive them in their Whisper tab.

-   [Login] Remove wine #261

    -   There is a picture with a wine glass in Uhuru. Should be removed and replaced with something less western minded

-   [Error] 404 button padding #279

    -   Add passing to return button

-   [Whisper] Char limit on message #281

    -   When the message is too long with full of emojis, the application is crashing

-   [Dialogs] Add escape close dialog option to all dialogs #357

-   [Whisper] Error should be above 'Group name' #298

# Bugs

-   [Quantum] file share move breaks #191

    -   If you move a file in Quantum, the url of the file does not work anymore

-   [Flow] When changing your profile picture it changes everywhere except in the timeline. (See more explanation in attachment) #285

    -   User avatar was not updates of flow posts

-   [Quantum] Unable to rename/download saved attachments #280

    -   Fix not being able to rename/download saved attachments

-   [Flow] When you go into share dialog and have no friends, make sure no error occurs #252

    -   Fix console errors

-   [Flow] If you hover over the avatar of a comment everything moves around. #294

    -   Fix everything moves around
    -   Only show user hover panel if cursor is over the name or avatar for 1sec or more(Like on facebook).
    -   Fix user hover panel not dissapearing over post avatar.
    -   Better position for the hover panel, should be just above the user name (For both comments or posts).
    -   Like has no cursor pointer, and timestamp should not be a link.
    -   Make hover panel links work
    -   Fix bug -> After refresh the whisper link shows 'add friend' while it should be ''whisper'. When navigating between tabs it is correct.

-   [Flow] After refreshing the page user is shown as offline #293

    -   Switching between navigation makes you show as online again.

-   [Whisper] Delete user should be renamed to Delete chat #303

    -   You can't delete a contact for now. You just delete the message, so this should be renamed. Later on there will be a new feature added 'delete user'.

-   [Glass] when clicking on glass but you navigate to another page before the browser is loaded. The browser would spawn over your current page and the navigation is broken. Only when you click on glass again you can navigate again to other pages #286

-   [Whisper] Can't add certain users as contact in Whisper #254

    -   Not all users show in contact list

-   [Flow] Lennert007 creating a post, with Lennert008 as contact, but Lennert008 doesn't receive Lennert007's post on his feed #274

    -   Not all posts from contacts are displayed

-   [Whisper] Should not be able to add your own yggdrasil address #284

    -   Should not be able to add yourself

-   [Whisper] Add new contact after accepting chat #422

    -   New contacts are not added to contact list

-   [Quantum] Switcher between grid and list view is duplicated #421

-   [Whisper] Chat preview not truncating with extremely long messages #381

-   [Flow] can't share post #420

-   [Flow] No character limit on comments which makes the UI overflow off screen #379

-   [Whisper] Group always shows all users as online #347

-   [Flow] Cannot see posts by other people #377

    -   Can only see posts of one contact, not all

-   [Glass] Breaks on smaller screens #416

    -   Responsive Layout issue

-   [Flow] No character limit on flow posts. #375

-   [Flow] Can't see chat list on smaller screens #369

    -   Responsive Layout issue

-   [Whisper] Messages not sending (corrupt container?) #374

    -   Fix initial user public and private keys

-   [Whisper] System messages do not get sent to the admin of the group #332

    -   All group update messages are only sent to the admin

-   [Quantum] Wrong cursor style on table headers #400

    -   Layout - change to pointer

-   [Whisper] Translation wrong on create group #392

    -   Inital -> Initial

-   [Quantum] When creating a folder with special characters downloading/copy pasting files errors #395

    -   Add special characters check

-   [Whisper] Able to make a corrupt group chat where nothing works #393

    -   Add special characters check

-   [Flow] Can publish post without content or with just spaces #376

    -   When there is no content it just keeps loading. Publishing just spaces works though?

-   [Flow] If only PNG/JPEG files are supported then only those should be accepted in the media input #380

    -   Remove gifs from accepted properties

-   [Whisper] Possible to upload a picture that is 50MB+ #387

    -   Made everything very lag and I think there isn't even a limit on images sizes. EDIT: Also worked with an image that was 150MB and the chat is now barely usable due to lag.

-   [Whisper] Group invites don't always arrive. #88

-   [Glass] Remember state of browser #345

    -   When navigating between components, remember the state of the browser

-   [Flow] Refreshing the page when you have a chat open closes it #362

-   [Quantum] Deleting shared files #335

    -   If the owner deletes the file it should be removed from 'shared with me' for the other users...
    -   And the shared message should be deleted too in Whisper.
    -   Bug fix: If the owner shares a file it gets in his 'shared with me' map
    -   If you remove permissions of a user it doesn't get updated right away in this dialog...
    -   If the owner removes all permissions for a user they still see the file under 'shared with me'. But the link doesn't work, this should be removed...
    -   The message with the shared file should be removed too if the user has no more permissions.
    -   Can't delete a file sometimes
    -   If you share a file again with the same user it get's removed from his 'shared with me'
    -   Sharing the same file multiple times keeps getting added to your own chat.
    -   Modifying an existing share from read to write should replace it in your chat and the chat of the selected user

-   [Flow] Can not see added user posts on flow unless docker is restarted #360

    -   Contact is not added unless docker is restarted

-   [Flow] Change share image url to /api/v1 #361

    -   Change api versioning

-   [Flow] Fix online user status when clicking on username in flow

-   [Whisper/Quantum] - Downloading shared files url is wrongly formatted #354

    -   Change api versioning

-   [Whisper] If you accept connection request it gives error in backend. #330

    -   Fix backend error

-   [Quantum] Going to 'edit shares' of a file that has no shares gives console error #340

    -   Fix console error

-   [Whisper] Image in chat not working #350

    -   Change api versioning

-   [Flow] Remove someone is typing for yourself #344

-   [Flow] Fix initial user avatar (shows blank) #349

    -   Fix to show default avatar

-   [Flow] Can't change user avatar #338

-   [Quantum] Can't open/edit text files, page keeps on loading #341

    -   Change api versioning

-   [Frontend] Staging bugs/issues #337

    -   Remove >>>>>>> development from whisper page
    -   Fix ReferenceError: incomingchats is not defined
    -   Fix adding contact failed

-   [Backend] Fix yggdrasil empty address registration #343

    -   When registering you get an empty yggdrasil address in return

-   [Flow] Can't like comments #290

-   [Flow] Comments count is not correct from the posts #320

    -   Should be counting nested comments too

-   [Navbar] Fix responsive bar not working on small screens. #308

    -   Clicking on the arrow/burger icon doesn't do anything, should show the navigation.
    -   Restyle topBar and sideBar to be more responsive
    -   Fix whisper avatar for the topBar
    -   Navigation bar doesn't go away when clicking on 'Glass'
    -   Resizing the screen while on glass breaks everything. Problem found but need to find another way

-   [Whisper] User chat #304

    -   If a user is blocked -> right click should 'unblock user'
    -   Change 'delete chat' back to 'delete user'
    -   Remember the last chat that was opened (localstorage 'lastOpenedChat').
    -   Removing chat gives error in console
    -   Test on bugs for 1st release

-   [Whisper] Group chat #301

    -   'Delete conversation' should be 'leave group'.
    -   Change the warnings for leaving the group accordingly (right click group and via actions) .
    -   Right click of group chat should be 'group' not 'user'.
    -   Block user does nothing if you right click on the group chat
    -   There should not be a X next to your own name as owner of the group
    -   Names are not centered horizontally
    -   Clicking on the list item should add the user instead of the small '+' (or make the + bigger).
    -   Hovering over the list item should light up.
    -   Adding a user to the group chat after it is created gives errors because the connection request doesn't work. He should not get a connection request for group chats.
    -   You can add users to the group that are already in the group. They should not come up in the search if they are already in the group.
    -   Removing a user gives error: no such file or directory, open '/appdata/chats/376c7b60-c129-4997-ba56-dd90f1102481/chat.json'. If a user is on a chat page that doesn't exist he should be redirected to /whisper instead of showing this page:
    -   Invite to group should be changed to Add to group since you can add someone without invitation.
    -   Wrong online count

-   [Backend] Logged in as another user, possible to see all files/chats. #282

    -   On first screen, enter kendemoor.3bot
    -   On login page, change 3bot name to typical.3bot (whatever valid 3bot account you have)
    -   Follow the login
    -   Auth middleware issue

-   [Flow] If you add a comment you get an error #323
    -   It is because of the 'someone is typing' event.
