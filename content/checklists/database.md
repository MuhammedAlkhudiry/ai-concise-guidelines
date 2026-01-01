# Database Checklist

## What to Check

### Migrations
- [ ] Migration is reversible (has down method)
- [ ] No data loss on rollback
- [ ] Large tables use batching
- [ ] Locks minimized (avoid long-running migrations)
- [ ] Tested on production-size data

### Schema Design
- [ ] Appropriate data types chosen
- [ ] Nullable only when necessary
- [ ] Defaults set where appropriate
- [ ] Foreign keys defined
- [ ] Unique constraints where needed

### Indexes
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Composite indexes in correct order
- [ ] No over-indexing (write penalty)
- [ ] Covering indexes for common queries

### Data Integrity
- [ ] Constraints enforce business rules
- [ ] Cascading deletes considered carefully
- [ ] Soft deletes where appropriate
- [ ] Audit trails for sensitive data
- [ ] No orphaned records possible

### Query Safety
- [ ] Parameterized queries (no SQL injection)
- [ ] Transactions for multi-step operations
- [ ] Deadlock prevention considered
- [ ] Connection limits respected
- [ ] Timeouts set for long queries

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | Irreversible migration, data loss risk, missing critical index, SQL injection |
| **Should Fix** | Missing foreign key, no index on frequently queried column, bad data types |
| **Minor** | Could optimize query, minor schema improvement |

---

## Common Issues

### Non-Reversible Migration
```php
// BAD - can't undo
public function down() {
    // Nothing here!
}

// GOOD - reversible
public function down() {
    Schema::dropIfExists('posts');
}
```

### Missing Index
```php
// BAD - no index on queried column
Schema::create('orders', function (Blueprint $table) {
    $table->foreignId('user_id');
    $table->string('status');
});

// GOOD - indexed
Schema::create('orders', function (Blueprint $table) {
    $table->foreignId('user_id')->index();
    $table->string('status')->index();
});
```

### Unsafe Migration on Large Table
```php
// BAD - locks entire table
Schema::table('users', function (Blueprint $table) {
    $table->string('new_column');
});

// GOOD - use batching or online DDL
// Consider: pt-online-schema-change, gh-ost, or database-specific online DDL
```

### Missing Transaction
```php
// BAD - partial failure possible
$order = Order::create([...]);
$payment = Payment::create([...]);
Inventory::decrement([...]);

// GOOD - atomic
DB::transaction(function () {
    $order = Order::create([...]);
    $payment = Payment::create([...]);
    Inventory::decrement([...]);
});
```

---

## Rules

1. **Always reversible** — Every migration must have a working down()
2. **Test on prod-size data** — Small datasets hide problems
3. **Index foreign keys** — Almost always needed
4. **Use transactions** — For multi-step operations
5. **Consider locks** — Large table changes need careful planning
