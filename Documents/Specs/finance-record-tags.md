# Finance record tags
## UX 🎨
### Save finance record
- when creating or editing a finance record, users can associate one or more tags
    + e.g. you can create an expense with tags "fun", "gift"
- there's a combobox to select an existing tag
- there's an option to create a new tag on-the-fly
- tags should be all lowercase with a character limit of 25

### Tag management
- users can visit a separate page to manage their finance tags
    + include a link on the main finances page
- tags are lowercase and unique
- tags are categorized by finance record type
    + e.g. a user can have "revenue: other" and "expense: other" tags
- tags are sorted alphabetically
- users can create, delete, and rename tags

#### Create tag
- show a modal with a finance type input, name input, save button, and cancel button
- display max tag length (e.g. 20 characters)
    + consider representing this is a character counter
- if type + name is a duplicate, disable save button and display an error message

#### Delete tag
- show a confirmation modal containing the tag to delete

#### Rename tag
- show modal with finance type input and name input
    + these should be pre-populated based on the tag the user wants to rename
- if updated type + name already exists, display a warning:
    + something like, "Tag X already exists. Do you want to merge Y with X?"


## Database schema 💾
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL -- With case-insensitive collation.
);

CREATE TABLE finance_user_tags (
    id SERIAL PRIMARY KEY,
    type finance_record_type NOT NULL,
    tag_id INT REFERENCES tags (id),
    user_id INT REFERENCES users (id),

    UNIQUE (user_id, tag_id, type)
);

CREATE TABLE finance_record_tags (
    finance_record_id INT REFERENCES finance_records (id),
    tag_id INT REFERENCES tags (id),

    PRIMARY KEY (finance_record_id, tag_id)
);
```

### Q: Why is `finance_user_tags` needed?
`finance_user_tags` holds tags that a user has created for a particular finance record type.
- e.g. "revenue gift", "expense food"

This is needed to support tag autocompletion. We need to know which tags the user has created
to populate the autocomplete combobox.

This is possible without a separate table. e.g. Query the distinct tags that are associated
with any finance record created by the user. The problem with this approach is that a tag can't
exist unless it's associated with at least one finance record.

### Q: Why does `finance_user_tags` have a surrogate key? Why not use the user ID, tag ID, and type as  the PK?
Having that ID makes some endpoints a little simpler. For example, with a surrogate key, we can
create a delete endpoint as `DELETE /finance-user-tags/:id`. Without the surrogate key, we would
need a URL like `DELETE /finance-user-tags/:name/:type`, which would still be possible to
implement, but would also be more complicated.

### Q: Why a surrogate key for the tags table? Why not use the tag name as a primary key?
Two options:
1. Use the tag name as the natural PK (primary key). Only 1 column needed
2. Use a surrogate serial PK along with the tag name

A natural key makes sense because tags will never change after creation and would make it easy
to see which finance records are linked to which tags without needing to do a join.

A surrogate key makes sense because it will take up less storage overall: tags will be referenced
in multiple tables. Storing an int foreign key will take up less space than a string, which
could be up to 20 characters long (and subject to increase in size in the future). Joins are
also faster with an int rather than string.

I opted to use a surrogate key because of the storage and performance benefits described above. I
also don't mind doing the joins when poking around in the DB, so the benefit of a natural key isn't a
huge deal for me (the only person working on this app).

## Business logic 💼
### GET all finance user tags created by the user
Create a GET endpoint that returns all finance user tags created by the request user.

#### Q: Why not return the tags directly?
The finance record type is stored on the `finance_user_tag` record, not the `tag` record.

### GET single finance user tag by ID
Need to also check that the request user created the tag.

I don't think this endpoint will be used by the client. I created this endpoint so I could use
`CreatedAtRoute` in the POST finance user tag endpoint (`CreatedAtRoute` expects you to pass the
location of the created entity. In this case, the URL to fetch the created finance tag).

### POST create a finance user tag
Request:
- finance record type
- tag name

If a user has already created a finance user tag with the same type and tag, return a 409.
If the tag doesn't exist, it needs to be created before creating the finance user tag.

### DELETE finance user tag
Request:
- URL: finance user tag ID

When removing a finance user tag, we need to remove the associated tag from all finance records of
the same type created by the user.

For example, say we want to delete "expense gift". We should delete all finance record tags
where:
- the user ID is the request user
- the tag name is "gift"
- the type is "expense"

And we shouldn't remove the "gift" tag from any finance records of type "revenue".

### POST / PATCH finance record with tags
1. If tags aren't included, no changes needed to existing flows.
2. Validate request tags
   + fetch finance user tags based on the type of the finance record to create / edit
   + confirm that each request tag has a matching finance user tag of the same type
   + if invalid tag found, return a validation error
3. Insert finance user tags that are in the request tags and not associated with the finance record
4. Delete finance user tags that are associated with the finance record and not in the request tags

### POST rename finance tag
A POST endpoint should be created to support renaming a finance tag. For example, the client
may want to rename "revenue gift" to "revenue contribution" (or whatever).

Request:
- URL param: finance tag ID
- body: updated name

#### Algorithm
1. Check if the user owns the tag to update.
    + if no, return a 404
2. Check if hte user already has a finance tag with the updated tag name
    + if no, create it. Also, create the associated tag if it doesn't exist
3. Find all finance record tags associated with the current finance tag.
    + this can be done by fetching a list of finance record tags where the finance record type
      matches the current tag type and the tag ID matches the current tag ID
4. Of the above tags, find the subset of finance record IDs already associated with the updated tag.
5. Insert `finance_record_tags` with the updated tag
6. Delete `finance_record_tags` with the current tag
7. Delete the current finance tag

#### Q: Why a POST endpoint?
I didn't think PATCH was appropriate because we're not partially updating the finance user tag.
This endpoint removes the finance user tag indicated by the URL parameter and returns a different
(potentially newly-created) finance user tag.

PUT doesn't feel appropriate either. The user isn't passing in all the fields for a finance user tag
(only the updated tag name). This endpoint also deletes the finance user tag being renamed. After
renaming, if make a GET request to `/finance-user-tags/:renamed-id`, you would get a 404 because the
finance user tag was deleted.


## Referenced resources 🔗
- http://howto.philippkeller.com/2005/04/24/Tags-Database-schemas/
