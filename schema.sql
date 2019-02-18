create table artworks (
    id serial primary key,
    title varchar(100),
    width integer,
    height integer,
    medium varchar(200),
    image bytea
);