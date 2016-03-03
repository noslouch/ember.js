import { RenderingTest } from './test-case';
import { get } from 'ember-metal/property_get';
import { set } from 'ember-metal/property_set';
import assign from 'ember-metal/assign';
import EmberObject from 'ember-runtime/system/object';
import ObjectProxy from 'ember-runtime/system/object_proxy';
import { A as emberA } from 'ember-runtime/system/native_array';
import ArrayProxy from 'ember-runtime/system/array_proxy';

class AbstractConditionalsTest extends RenderingTest {

  wrapperFor(templates) {
    return templates.join('');
  }

  wrappedTemplateFor(options) {
    return this.wrapperFor([this.templateFor(options)]);
  }

  /* abstract */
  templateFor({ cond, truthy, falsy }) {
    // e.g. `{{#if ${cond}}}${truthy}{{else}}${falsy}{{/if}}`
    throw new Error('Not implemented: `templateFor`');
  }

  /* abstract */
  renderValues(...values) {
    throw new Error('Not implemented: `renderValues`');
  }

}

/*
  The test cases in this file generally follow the following pattern:

  1. Render with [ truthy, ...(other truthy variations), falsy, ...(other falsy variations) ]
  2. No-op rerender
  3. Make all of them falsy (through interior mutation)
  4. Make all of them truthy (through interior mutation, sometimes with some slight variations)
  5. Reset them to their original values (through replacement)
*/

export const BASIC_TRUTHY_TESTS = {

  truthyValue: true,
  falsyValue: false,

  cases: [
    true,
    ' ',
    'hello',
    'false',
    'null',
    'undefined',
    1,
    ['hello'],
    emberA(['hello']),
    {},
    { foo: 'bar' },
    EmberObject.create(),
    EmberObject.create({ foo: 'bar' }),
    EmberObject.create({ isTruthy: true }),
    /*jshint -W053 */
    new String('hello'),
    new String(''),
    new Boolean(true),
    new Boolean(false),
    new Date()
    /*jshint +W053 */
  ],

  generate(value, description) {
    return {

      [`@test it should consider ${JSON.stringify(value)} truthy`]() {
        this.renderValues(value);

        this.assertText('T1');

        this.runTask(() => this.rerender());

        this.assertText('T1');

        this.runTask(() => set(this.context, 'cond1', description.falsyValue));

        this.assertText('F1');

        this.runTask(() => set(this.context, 'cond1', value));

        this.assertText('T1');
      }

    };
  }

};

export const BASIC_FALSY_TESTS = {

  truthyValue: true,
  falsyValue: false,

  cases: [
    false,
    null,
    undefined,
    '',
    0,
    [],
    emberA(),
    EmberObject.create({ isTruthy: false })
  ],

  generate(value, description) {
    let tests = {

      [`@test it should consider ${JSON.stringify(value)} falsy`]() {
        this.renderValues(value);

        this.assertText('F1');

        this.runTask(() => this.rerender());

        this.assertText('F1');

        this.runTask(() => set(this.context, 'cond1', description.truthyValue));

        this.assertText('T1');

        this.runTask(() => set(this.context, 'cond1', value));

        this.assertText('F1');
      }

    };

    if (value !== false) {
      // Only `{ isTruthy: false }` is falsy, `{ isTruthy: null }` etc are not

      tests[`@test it should consider { isTruthy: ${JSON.stringify(value)} } truthy`] = function() {
        this.renderValues({ isTruthy: value });

        this.assertText('T1');

        this.runTask(() => this.rerender());

        this.assertText('T1');

        this.runTask(() => set(this.context, 'cond1.isTruthy', description.falsyValue));

        this.assertText('F1');

        this.runTask(() => set(this.context, 'cond1', { isTruthy: value }));

        this.assertText('T1');
      };
    }

    return tests;
  }

};

export class SharedConditionalsTest extends AbstractConditionalsTest {

  ['@test it renders the corresponding block based on the conditional']() {
    this.renderValues(true, false);

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => set(this.context, 'cond1', false));

    this.assertText('F1F2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', true);
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', false);
    });

    this.assertText('T1F2');
  }

  ['@test it tests for `isTruthy` if available']() {
    this.renderValues({ isTruthy: true }, { isTruthy: false });

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => set(this.context, 'cond1.isTruthy', false));

    this.assertText('F1F2');

    this.runTask(() => {
      set(this.context, 'cond1.isTruthy', true);
      set(this.context, 'cond2.isTruthy', true);
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', { isTruthy: true });
      set(this.context, 'cond2', { isTruthy: false });
    });

    this.assertText('T1F2');
  }

  ['@test it tests for `isTruthy` on Ember objects if available']() {
    this.renderValues(
      EmberObject.create({ isTruthy: true }),
      EmberObject.create({ isTruthy: false })
    );

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => set(this.context, 'cond1.isTruthy', false));

    this.assertText('F1F2');

    this.runTask(() => {
      set(this.context, 'cond1.isTruthy', true);
      set(this.context, 'cond2.isTruthy', true);
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', EmberObject.create({ isTruthy: true }));
      set(this.context, 'cond2', EmberObject.create({ isTruthy: false }));
    });

    this.assertText('T1F2');
  }

  ['@test it considers empty arrays falsy']() {
    this.renderValues(
      emberA(['hello']),
      emberA()
    );

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => get(this.context, 'cond1').removeAt(0));

    this.assertText('F1F2');

    this.runTask(() => {
      get(this.context, 'cond1').pushObject('hello');
      get(this.context, 'cond2').pushObjects([1, 2, 3]);
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', emberA(['hello']));
      set(this.context, 'cond2', emberA());
    });

    this.assertText('T1F2');
  }

  ['@test it considers object proxies without content falsy']() {
    this.renderValues(
      ObjectProxy.create({ content: {} }),
      ObjectProxy.create({ content: EmberObject.create() }),
      ObjectProxy.create({ content: null })
    );

    this.assertText('T1T2F3');

    this.runTask(() => this.rerender());

    this.assertText('T1T2F3');

    this.runTask(() => {
      set(this.context, 'cond1.content', null);
      set(this.context, 'cond2.content', null);
    });

    this.assertText('F1F2F3');

    this.runTask(() => {
      set(this.context, 'cond1.content', EmberObject.create());
      set(this.context, 'cond2.content', {});
      set(this.context, 'cond3.content', { foo: 'bar' });
    });

    this.assertText('T1T2T3');

    this.runTask(() => {
      set(this.context, 'cond1', ObjectProxy.create({ content: {} }));
      set(this.context, 'cond2', ObjectProxy.create({ content: EmberObject.create() }));
      set(this.context, 'cond3', ObjectProxy.create({ content: null }));
    });

    this.assertText('T1T2F3');
  }

  ['@test it considers array proxies without content falsy']() {
    this.renderValues(
      ArrayProxy.create({ content: emberA(['hello']) }),
      ArrayProxy.create({ content: null })
    );

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => {
      set(this.context, 'cond1.content', null);
      set(this.context, 'cond2.content', null);
    });

    this.assertText('F1F2');

    this.runTask(() => {
      set(this.context, 'cond1.content', emberA(['hello']));
      set(this.context, 'cond2.content', emberA([1, 2, 3]));
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', ArrayProxy.create({ content: emberA(['hello']) }));
      set(this.context, 'cond2', ArrayProxy.create({ content: null }));
    });

    this.assertText('T1F2');
  }

  ['@test it considers array proxies with empty arrays falsy']() {
    this.renderValues(
      ArrayProxy.create({ content: emberA(['hello']) }),
      ArrayProxy.create({ content: emberA() })
    );

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => get(this.context, 'cond1.content').removeAt(0));

    this.assertText('F1F2');

    this.runTask(() => {
      get(this.context, 'cond1.content').pushObject('hello');
      get(this.context, 'cond2.content').pushObjects([1, 2, 3]);
    });

    this.assertText('T1T2');

    this.runTask(() => {
      set(this.context, 'cond1', ArrayProxy.create({ content: emberA(['hello']) }));
      set(this.context, 'cond2', ArrayProxy.create({ content: emberA() }));
    });

    this.assertText('T1F2');
  }

  ['@test it maintains DOM stability when condition changes from a truthy to a different truthy value']() {
    this.renderValues(true);

    this.assertText('T1');

    this.takeSnapshot();

    this.runTask(() => set(this.context, 'cond1', 'hello'));

    this.assertText('T1');

    this.assertInvariants();
  }

  ['@test it maintains DOM stability when condition changes from a falsy to a different falsy value']() {
    this.renderValues(false);

    this.assertText('F1');

    this.takeSnapshot();

    this.runTask(() => set(this.context, 'cond1', ''));

    this.assertText('F1');

    this.assertInvariants();
  }

}

export class SharedHelperConditionalsTest extends SharedConditionalsTest {

  renderValues(...values) {
    let templates = [];
    let context = {};

    for (let i = 1; i <= values.length; i++) {
      templates.push(this.templateFor({ cond: `cond${i}`, truthy: `t${i}`, falsy: `f${i}` }));
      context[`t${i}`] = `T${i}`;
      context[`f${i}`] = `F${i}`;
      context[`cond${i}`] = values[i - 1];
    }

    let wrappedTemplate = this.wrapperFor(templates);
    this.render(wrappedTemplate, context);
  }

  ['@htmlbars it does not update when the unbound helper is used']() {
    let template = `${
      this.wrappedTemplateFor({ cond: '(unbound cond1)', truthy: '"T1"', falsy: '"F1"' })
    }${
      this.wrappedTemplateFor({ cond: '(unbound cond2)', truthy: '"T2"', falsy: '"F2"' })
    }`;

    this.render(template, { cond1: true, cond2: false });

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => set(this.context, 'cond1', false));

    this.assertText('T1F2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', true);
    });

    this.assertText('T1F2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', false);
    });

    this.assertText('T1F2');
  }

  ['@test it tests for `isTruthy` on the context if available']() {
    let template = this.wrappedTemplateFor({ cond: 'this', truthy: '"T1"', falsy: '"F1"' });

    this.render(template, { isTruthy: true });

    this.assertText('T1');

    this.runTask(() => this.rerender());

    this.assertText('T1');

    this.runTask(() => set(this.context, 'isTruthy', false));

    this.assertText('F1');

    this.runTask(() => set(this.context, 'isTruthy', true));

    this.assertText('T1');
  }

}

export class SharedSyntaxConditionalsTest extends SharedConditionalsTest {

  renderValues(...values) {
    let templates = [];
    let context = {};

    for (let i = 1; i <= values.length; i++) {
      templates.push(this.templateFor({ cond: `cond${i}`, truthy: `{{t}}${i}`, falsy: `{{f}}${i}` }));
      context[`cond${i}`] = values[i - 1];
    }

    let wrappedTemplate = this.wrapperFor(templates);
    this.render(wrappedTemplate, assign({ t: 'T', f: 'F' }, context));
  }

  ['@htmlbars it does not update when the unbound helper is used']() {
    let template = `${
      this.templateFor({ cond: '(unbound cond1)', truthy: 'T1', falsy: 'F1' })
    }${
      this.templateFor({ cond: '(unbound cond2)', truthy: 'T2', falsy: 'F2' })
    }`;

    this.render(template, { cond1: true, cond2: false });

    this.assertText('T1F2');

    this.runTask(() => this.rerender());

    this.assertText('T1F2');

    this.runTask(() => set(this.context, 'cond1', false));

    this.assertText('T1F2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', true);
    });

    this.assertText('T1F2');

    this.runTask(() => {
      set(this.context, 'cond1', true);
      set(this.context, 'cond2', false);
    });

    this.assertText('T1F2');
  }

  ['@test it tests for `isTruthy` on the context if available']() {
    let template = this.wrappedTemplateFor({ cond: 'this', truthy: 'T1', falsy: 'F1' });

    this.render(template, { isTruthy: true });

    this.assertText('T1');

    this.runTask(() => this.rerender());

    this.assertText('T1');

    this.runTask(() => set(this.context, 'isTruthy', false));

    this.assertText('F1');

    this.runTask(() => set(this.context, 'isTruthy', true));

    this.assertText('T1');
  }

  ['@htmlbars it updates correctly when enclosing another conditional']() {
    // This tests whether the outer conditional tracks its bounds correctly as its inner bounds changes
    let template = this.wrappedTemplateFor({ cond: 'outer', truthy: '{{#if inner}}T-inner{{else}}F-inner{{/if}}', falsy: 'F-outer' });

    this.render(template, { outer: true, inner: true });

    this.assertText('T-inner');

    this.runTask(() => this.rerender());

    this.assertText('T-inner');

    // Changes the inner bounds
    this.runTask(() => set(this.context, 'inner', false));

    this.assertText('F-inner');

    // Now rerender the outer conditional, which require first clearing its bounds
    this.runTask(() => set(this.context, 'outer', false));

    this.assertText('F-outer');
  }

  ['@htmlbars it updates correctly when enclosing #each']() {
    // This tests whether the outer conditional tracks its bounds correctly as its inner bounds changes
    let template = this.wrappedTemplateFor({ cond: 'outer', truthy: '{{#each inner as |text|}}{{text}}{{/each}}', falsy: 'F-outer' });

    this.render(template, { outer: true, inner: ['inner', '-', 'before'] });

    this.assertText('inner-before');

    this.runTask(() => this.rerender());

    this.assertText('inner-before');

    // Changes the inner bounds
    this.runTask(() => set(this.context, 'inner', ['inner-after']));

    this.assertText('inner-after');

    // Now rerender the outer conditional, which require first clearing its bounds
    this.runTask(() => set(this.context, 'outer', false));

    this.assertText('F-outer');

    // Reset
    this.runTask(() => {
      set(this.context, 'inner', ['inner-again']);
      set(this.context, 'outer', true);
    });

    this.assertText('inner-again');

    // Now clear the inner bounds
    this.runTask(() => set(this.context, 'inner', []));

    this.assertText('');

    // Now rerender the outer conditional, which require first clearing its bounds
    this.runTask(() => set(this.context, 'outer', false));

    this.assertText('F-outer');
  }

  ['@htmlbars it updates correctly when enclosing triple-curlies']() {
    // This tests whether the outer conditional tracks its bounds correctly as its inner bounds changes
    let template = this.wrappedTemplateFor({ cond: 'outer', truthy: '{{{inner}}}', falsy: 'F-outer' });

    this.render(template, { outer: true, inner: '<b>inner</b>-<b>before</b>' });

    this.assertText('inner-before');

    this.runTask(() => this.rerender());

    this.assertText('inner-before');

    // Changes the inner bounds
    this.runTask(() => set(this.context, 'inner', '<p>inner-after</p>'));

    this.assertText('inner-after');

    // Now rerender the outer conditional, which require first clearing its bounds
    this.runTask(() => set(this.context, 'outer', false));

    this.assertText('F-outer');
  }

}
