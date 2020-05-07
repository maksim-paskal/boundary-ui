import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/radio/group', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.equal(findAll('input').length, 2);
    assert.equal(findAll('input')[0].name, 'bird');
    assert.equal(findAll('input')[1].name, 'bird');
  });

  test('it renders with @variable value selected', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" @variable="flamingo" as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.equal(findAll('#bird-1')[0].checked, false);
    assert.equal(findAll('#bird-2')[0].checked, true);

    await click(findAll('#bird-1')[0]);

    assert.equal(findAll('#bird-1')[0].checked, true);
    assert.equal(findAll('#bird-2')[0].checked, false);
  });
});
