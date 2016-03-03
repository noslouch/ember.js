import { moduleFor } from '../../utils/test-case';
import { set } from 'ember-metal/property_set';
import assign from 'ember-metal/assign';
import { A as emberA } from 'ember-runtime/system/native_array';
import {
  BASIC_TRUTHY_TESTS,
  BASIC_FALSY_TESTS,
  SharedSyntaxConditionalsTest
} from '../../utils/shared-conditional-tests';
import { RenderingTest } from '../../utils/test-case';

const EACH_TRUTHY_TESTS = assign({}, BASIC_TRUTHY_TESTS, {

  truthyValue: ['non-empty'],
  falsyValue: [],

  cases: [
    // TODO: figure out what the rest of the cases are
    ['hello']
  ]

});

const EACH_FALSY_TESTS = assign({}, BASIC_FALSY_TESTS, {

  truthyValue: ['non-empty'],
  falsyValue: [],

  cases: [
    // TODO: figure out what the rest of the cases are
    [],
    undefined
  ]

});

moduleFor('@glimmer Syntax test: {{#each}}', class extends SharedSyntaxConditionalsTest {
  templateFor({ cond, truthy, falsy }) {
    return `{{#each ${cond}}}${truthy}{{else}}${falsy}{{/each}}`;
  }
}, EACH_TRUTHY_TESTS, EACH_FALSY_TESTS);

moduleFor('@glimmer Syntax test: {{#each as}}', class extends SharedSyntaxConditionalsTest {
  templateFor({ cond, truthy, falsy }) {
    return `{{#each ${cond} as |test|}}${truthy}{{else}}${falsy}{{/each}}`;
  }

  ['@test it repeats the given block for each item in the array']() {
    this.render(`{{#each list as |item|}}{{item.greeting}}{{else}}Empty{{/each}}`, {
      list: emberA([{ greeting: 'hello' }])
    });

    this.assertText('hello');

    this.runTask(() => this.rerender());

    this.assertText('hello');

    this.runTask(() => set(this.context.get('list').objectAt(0), 'greeting', 'Hello'));

    this.assertText('Hello');

    this.runTask(() => {
      let list = this.context.get('list');
      list.pushObject({ greeting: ' ' });
      list.pushObject({ greeting: 'world' });
    });

    this.assertText('Hello world');

    this.runTask(() => this.context.get('list').clear());

    this.assertText('Empty');

    this.runTask(() => set(this.context, 'list', [{ greeting: 'hello' }]));

    this.assertText('hello');
  }

  // ['@test can access alias and original scope']() {
  //   this.render(`{{#with person as |tom|}}{{title}}: {{tom.name}}{{/with}}`, {
  //     title: 'Señor Engineer',
  //     person: { name: 'Tom Dale' }
  //   });

  //   this.assertText('Señor Engineer: Tom Dale');

  //   this.runTask(() => this.rerender());

  //   this.assertText('Señor Engineer: Tom Dale');

  //   this.runTask(() => {
  //     set(this.context, 'person.name', 'Yehuda Katz');
  //     set(this.context, 'title', 'Principal Engineer');
  //   });

  //   this.assertText('Principal Engineer: Yehuda Katz');

  //   this.runTask(() => {
  //     set(this.context, 'person', { name: 'Tom Dale' });
  //     set(this.context, 'title', 'Señor Engineer');
  //   });

  //   this.assertText('Señor Engineer: Tom Dale');
  // }

  // ['@test the scoped variable is not available outside the {{with}} block.']() {
  //   this.render(`{{name}}-{{#with other as |name|}}{{name}}{{/with}}-{{name}}`, {
  //     name: 'Stef',
  //     other: 'Yehuda'
  //   });

  //   this.assertText('Stef-Yehuda-Stef');

  //   this.runTask(() => this.rerender());

  //   this.assertText('Stef-Yehuda-Stef');

  //   this.runTask(() => set(this.context, 'other', 'Chad'));

  //   this.assertText('Stef-Chad-Stef');

  //   this.runTask(() => set(this.context, 'name', 'Tom'));

  //   this.assertText('Tom-Chad-Tom');

  //   this.runTask(() => {
  //     set(this.context, 'name', 'Stef');
  //     set(this.context, 'other', 'Yehuda');
  //   });

  //   this.assertText('Stef-Yehuda-Stef');
  // }

  // ['@test inverse template is displayed with context']() {
  //   this.render(`{{#with falsyThing as |thing|}}Has Thing{{else}}No Thing {{otherThing}}{{/with}}`, {
  //     falsyThing: null,
  //     otherThing: 'bar'
  //   });

  //   this.assertText('No Thing bar');

  //   this.runTask(() => this.rerender());

  //   this.assertText('No Thing bar');

  //   this.runTask(() => set(this.context, 'falsyThing', true));

  //   this.assertText('Has Thing');

  //   this.runTask(() => set(this.context, 'otherThing', 'biz'));

  //   this.assertText('Has Thing');

  //   this.runTask(() => {
  //     set(this.context, 'otherThing', 'bar');
  //     set(this.context, 'falsyThing', null);
  //   });

  //   this.assertText('No Thing bar');
  // }

  // ['@test can access alias of an array']() {
  //   this.render(`{{#with arrayThing as |thing|}}{{#each thing as |value|}}{{value}}{{/each}}{{/with}}`, {
  //     arrayThing: ['a', 'b', 'c', 'd']
  //   });

  //   this.assertText('abcd');

  //   this.runTask(() => this.rerender());

  //   this.assertText('abcd');
  // }

  // ['@test empty arrays yield inverse']() {
  //   this.render(`{{#with arrayThing as |thing|}}{{thing}}{{else}}Empty Array{{/with}}`, {
  //     arrayThing: []
  //   });

  //   this.assertText('Empty Array');

  //   this.runTask(() => this.rerender());

  //   this.assertText('Empty Array');
  // }
}, EACH_TRUTHY_TESTS, EACH_FALSY_TESTS);

// moduleFor('Syntax test: Multiple {{#with as}} helpers', class extends RenderingTest {
//   ['@test re-using the same variable with different #with blocks does not override each other']() {
//     this.render(`Admin: {{#with admin as |person|}}{{person.name}}{{/with}} User: {{#with user as |person|}}{{person.name}}{{/with}}`, {
//       admin: { name: 'Tom Dale' },
//       user: { name: 'Yehuda Katz' }
//     });

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');

//     this.runTask(() => this.rerender());

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');

//     this.runTask(() => {
//       set(this.context, 'admin.name', 'Godfrey Chan');
//       set(this.context, 'user.name', 'Stefan Penner');
//     });

//     this.assertText('Admin: Godfrey Chan User: Stefan Penner');

//     this.runTask(() => {
//       set(this.context, 'admin', { name: 'Tom Dale' });
//       set(this.context, 'user', { name: 'Yehuda Katz' });
//     });

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');
//   }

//   ['@test re-using the same variable with different #with blocks does not override each other']() {
//     this.render(`Admin: {{#with admin as |person|}}{{person.name}}{{/with}} User: {{#with user as |person|}}{{person.name}}{{/with}}`, {
//       admin: { name: 'Tom Dale' },
//       user: { name: 'Yehuda Katz' }
//     });

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');

//     this.runTask(() => this.rerender());

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');

//     this.runTask(() => {
//       set(this.context, 'admin.name', 'Erik Bryn');
//       set(this.context, 'user.name', 'Chad Hietala');
//     });

//     this.assertText('Admin: Erik Bryn User: Chad Hietala');

//     this.runTask(() => {
//       set(this.context, 'admin', { name: 'Tom Dale' });
//       set(this.context, 'user', { name: 'Yehuda Katz' });
//     });

//     this.assertText('Admin: Tom Dale User: Yehuda Katz');
//   }

//   ['@test the scoped variable is not available outside the {{with}} block.']() {
//     this.render(`{{#with first as |ring|}}{{ring}}-{{#with fifth as |ring|}}{{ring}}-{{#with ninth as |ring|}}{{ring}}-{{/with}}{{ring}}-{{/with}}{{ring}}{{/with}}`, {
//       first: 'Limbo',
//       fifth: 'Wrath',
//       ninth: 'Treachery'
//     });

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');

//     this.runTask(() => this.rerender());

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');

//     this.runTask(() => {
//       set(this.context, 'first', 'I');
//       set(this.context, 'fifth', 'D');
//       set(this.context, 'ninth', 'K');
//     });

//     this.assertText('I-D-K-D-I');

//     this.runTask(() => {
//       set(this.context, 'first', 'Limbo');
//       set(this.context, 'fifth', 'Wrath');
//       set(this.context, 'ninth', 'Treachery');
//     });

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');
//   }

//   ['@test it should support #with name as |foo|, then #with foo as |bar|']() {
//     this.render(`{{#with name as |foo|}}{{#with foo as |bar|}}{{bar}}{{/with}}{{/with}}`, {
//       name: 'caterpillar'
//     });

//     this.assertText('caterpillar');

//     this.runTask(() => this.rerender());

//     this.assertText('caterpillar');

//     this.runTask(() => set(this.context, 'name', 'butterfly'));

//     this.assertText('butterfly');

//     this.runTask(() => set(this.context, 'name', 'caterpillar'));

//     this.assertText('caterpillar');
//   }

//   ['@test nested {{with}} blocks shadow the outer scoped variable properly.']() {
//     this.render(`{{#with first as |ring|}}{{ring}}-{{#with fifth as |ring|}}{{ring}}-{{#with ninth as |ring|}}{{ring}}-{{/with}}{{ring}}-{{/with}}{{ring}}{{/with}}`, {
//       first: 'Limbo',
//       fifth: 'Wrath',
//       ninth: 'Treachery'
//     });

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');

//     this.runTask(() => this.rerender());

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');

//     this.runTask(() => {
//       set(this.context, 'first', 'I');
//       set(this.context, 'ninth', 'K');
//     });

//     this.assertText('I-Wrath-K-Wrath-I');

//     this.runTask(() => {
//       set(this.context, 'first', 'Limbo');
//       set(this.context, 'fifth', 'Wrath');
//       set(this.context, 'ninth', 'Treachery');
//     });

//     this.assertText('Limbo-Wrath-Treachery-Wrath-Limbo');
//   }

//   ['@test updating the context should update the alias']() {
//     this.render(`{{#with this as |person|}}{{person.name}}{{/with}}`, {
//       name: 'Los Pivots'
//     });

//     this.assertText('Los Pivots');

//     this.runTask(() => this.rerender());

//     this.assertText('Los Pivots');

//     this.runTask(() => set(this.context, 'name', 'l\'Pivots'));

//     this.assertText('l\'Pivots');

//     this.runTask(() => set(this.context, 'name', 'Los Pivots'));

//     this.assertText('Los Pivots');
//   }
// }, EACH_TRUTHY_TESTS, EACH_FALSY_TESTS);
