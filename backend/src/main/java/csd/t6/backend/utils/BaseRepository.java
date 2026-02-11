package csd.t6.backend.utils;

import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UpdatableRecord;

/**
 * Base repository class providing common CRUD operations for JOOQ-based
 * repositories.
 *
 * @param <TRecord> the type of the JOOQ record
 */
public abstract class BaseRepository<TRecord extends UpdatableRecord<TRecord>> {
  protected final DSLContext dsl;
  protected final Table<TRecord> table;

  public BaseRepository(DSLContext dsl, Table<TRecord> table) {
    this.dsl = dsl;
    this.table = table;
  }

  /**
   * Generic method to check if a value exists in a specified field.
   *
   * @param field - the field to check
   * @param value - the value to look for
   * @return true if an entity with the value in the field exists, false otherwise
   */
  public <T> boolean exists(TableField<TRecord, T> field, T value) {
    return this.dsl.fetchExists(this.dsl.selectOne().from(this.table).where(field.eq(value)));
  }

  /**
   * Generic method to find a record by a specified field.
   *
   * @param field - the field to find by
   * @param value - the value to look for
   * @return the record if found, empty otherwise
   */
  public <T> Optional<TRecord> findOneBy(TableField<TRecord, T> field, T value) {
    TRecord found = this.dsl.selectFrom(this.table).where(field.eq(value)).fetchOne();
    return Optional.ofNullable(found);
  }

  /**
   * Generic method to find many records by a specified field.
   * 
   * @param field - the field to find by
   * @param value - the value to look for
   * @return a list of records matching the criteria
   */
  public <T> List<TRecord> findBy(TableField<TRecord, T> field, T value) {
    return this.dsl.selectFrom(this.table).where(field.eq(value)).fetch();
  }

  /**
   * Find all records in the table.
   *
   * @return list of all records
   */
  public List<TRecord> findAll() {
    return this.dsl.selectFrom(this.table).fetch();
  }

  /**
   * Generic method to delete records by a specified field.
   * 
   * @param field - the field to delete by
   * @param value - the value to look for
   * @return the number of records deleted
   */
  public <T> int delete(TableField<TRecord, T> field, T value) {
    return this.dsl.deleteFrom(this.table).where(field.eq(value)).execute();
  }

  public TRecord save(TRecord record) {
    record.store();
    return record;
  }
}
